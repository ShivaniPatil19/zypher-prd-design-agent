// Load environment variables from .env into Deno.env
// This lets us use GROQ_API_KEY without extra flags.
import "jsr:@std/dotenv/load";

import {
  OpenAIModelProvider,
  createZypherContext,
  ZypherAgent,
} from "@corespeed/zypher";
import { eachValueFrom } from "rxjs-for-await";

/**
 * Helper to fetch a required environment variable.
 * If the variable is missing, we throw an error early instead of failing later.
 */
function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

async function main() {
  // 1) Determine which PRD file to use.
  //    If a file path is passed as a CLI argument, use that; otherwise default to sample_prd.txt.
  const inputPath = Deno.args[0] ?? "sample_prd.txt";
  console.log(`Using PRD file: ${inputPath}`);

  // 2) Read the PRD text from disk.
  let prdText: string;
  try {
    prdText = await Deno.readTextFile(inputPath);
  } catch (err) {
    console.error(`Failed to read file "${inputPath}":`, err);
    Deno.exit(1);
  }

  // 3) Initialize Zypher's context for this workspace (current directory).
  //    Zypher uses this to manage tasks, tools, and state for the agent.
  const zypherContext = await createZypherContext(Deno.cwd());

  // 4) Configure the model provider.
  //    Here we use Zypher's OpenAIModelProvider but point it at Groq's
  //    OpenAI-compatible API endpoint, authenticated via GROQ_API_KEY.
  const provider = new OpenAIModelProvider({
    apiKey: getRequiredEnv("GROQ_API_KEY"),
    baseUrl: "https://api.groq.com/openai/v1",
  });

  // 5) Create a ZypherAgent instance that will execute tasks using the provider + context above.
  const agent = new ZypherAgent(zypherContext, provider);

  // 6) Build the task description for our "ProductDesignAgent".
  //    This is the core prompt that explains:
  //      - the agent's role,
  //      - the exact sections we want in the output,
  //      - and embeds the PRD text at the end.
  const taskDescription = `
You are ProductDesignAgent, an expert product+engineering architect.

You will receive a product idea or rough requirements document.
Your job is to turn it into a *clear, structured design package* that a product & engineering team can execute on.

Follow this exact structure in your response:

# 1. Problem & Context
- Summarize the core problem and who the users are.
- Clarify the main user goals.

# 2. Key Use Cases & User Stories
- List the primary use cases.
- For each, include 2–4 user stories in the form:
  - "As a <type of user>, I want <goal> so that <benefit>."

# 3. API Design
- Propose a REST-style API for the feature.
- For each endpoint, specify:
  - Method & path (e.g., POST /receipts)
  - Purpose
  - Request body (JSON schema)
  - Response body (JSON schema)
  - Important status codes

# 4. Data Model
- List the main entities (e.g., User, Receipt, Project).
- For each entity, define:
  - Fields (name, type, brief description)
  - Relationships (e.g., "One User has many Receipts").

# 5. System Behavior & Flows
- Describe the main flows in step form (e.g., "User uploads X → System validates → …").
- Include at least one flow for:
  - Creating new data
  - Reading/searching
  - Updating or correcting mistakes

# 6. Non-Functional Requirements
- List performance, security, reliability, and UX constraints that are important.

# 7. Edge Cases & Failure Scenarios
- List at least 5 edge cases the team should handle.

# 8. Risks & Open Questions
- List assumptions you had to make.
- List open questions for the product/engineering team.

Use clear, concise markdown.
Do NOT invent UI mockups as images; just describe them textually if needed.

Here is the input product idea / PRD:

<<<PRD_START
${prdText}
PRD_END>>>
`.trim();

  // 7) Choose the Groq model to use.
  //    This is a current Llama 3.3 70B model exposed via the OpenAI-compatible API.
  const modelName = "llama-3.3-70b-versatile";

  console.log("Running ProductDesignAgent with Zypher + Groq...\n");

  // 8) Ask Zypher to run the task.
  //    Zypher returns a stream of events (tokens / messages) rather than a single blob.
  const event$ = agent.runTask(taskDescription, modelName);

  // 9) Collect the streamed text events into a single markdown string.
  //    This avoids dumping raw event objects and gives us a clean design document at the end.
  let finalText = "";

  for await (const event of eachValueFrom(event$)) {
    // Zypher can emit different event types; here we only care about the text chunks.
    if (event.type === "text") {
      finalText += event.content;
    }
  }

  // 10) Print the final generated design in a readable way.
  console.log("\n================= GENERATED DESIGN =================\n");
  console.log(finalText.trim());
  console.log("\n====================================================\n");
}

// Standard Deno pattern: only run main() when this file is executed directly,
// not when it's imported from another module.
if (import.meta.main) {
  main();
}
