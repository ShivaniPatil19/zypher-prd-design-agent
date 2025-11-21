import {
  AnthropicModelProvider,
  createZypherContext,
  ZypherAgent,
} from "@corespeed/zypher";
import { eachValueFrom } from "rxjs-for-await";

// Helper to fetch required env vars
function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

async function main() {
  // 1) Get PRD file path from CLI args (or default)
  const inputPath = Deno.args[0] ?? "sample_prd.txt";

  console.log(`Using PRD file: ${inputPath}`);

  let prdText: string;
  try {
    prdText = await Deno.readTextFile(inputPath);
  } catch (err) {
    console.error(`Failed to read file "${inputPath}":`, err);
    Deno.exit(1);
  }

  // 2) Initialize Zypher context (workspace is current directory)
  const zypherContext = await createZypherContext(Deno.cwd());

  // 3) Configure Anthropic provider (Claude)
  const provider = new AnthropicModelProvider({
    apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
  });

  // 4) Create Zypher agent
  const agent = new ZypherAgent(zypherContext, provider);

  // 5) Define the task prompt for the Product Requirements-to-Design Agent
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

  // 6) Run the task with Zypher and stream events
  const modelName = "claude-sonnet-4-20250514";

  console.log("Running ProductDesignAgent with Zypher...\n");

  const event$ = agent.runTask(taskDescription, modelName);

  // 7) Stream events as they arrive
  for await (const event of eachValueFrom(event$)) {
    console.log(event);
  }
}

// Entry point
if (import.meta.main) {
  main();
}
