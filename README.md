# AI Product Requirements-to-Design Agent (Zypher + Groq)

This project is a clean, minimal, end-to-end AI agent built using Zypher and Groq.
The agent reads a text-based Product Requirements Document (PRD) and generates a structured, engineering-ready design document.

The purpose of this project is to demonstrate the ability to quickly learn Zypher, integrate it with an OpenAI-compatible LLM provider, and build a functional reasoning agent.

---------------------------------------------------------------------

## Overview

Given a PRD input file, the agent produces a detailed design document containing:

1. Problem and context
2. Key use cases and user stories
3. REST API design
4. Data model (entities, fields, relationships)
5. System behavior and flows
6. Non-functional requirements
7. Edge cases and failure scenarios
8. Risks and open questions

The output is returned as clean Markdown.

---------------------------------------------------------------------

## Technologies Used

- Deno 2
- Zypher (CoreSpeed)
- Groq Llama 3.3-70B via OpenAI-compatible API
- TypeScript

---------------------------------------------------------------------

## Setup Instructions

Follow these steps to run the project locally.

### 1. Install Deno

Run:

```
curl -fsSL https://deno.land/install.sh | sh
```

Verify:

```
deno --version
```

### 2. Install Zypher Dependencies

Run:

```
deno install
```

### 3. Create a .env File

Create a file named `.env` in the project root:

```
GROQ_API_KEY=your_api_key_here
```

### 4. Add a PRD Text File

Example:

```
sample_prd.txt
```

---------------------------------------------------------------------

## Running the Agent

Run with the sample PRD:

```
deno run -A main.ts sample_prd.txt
```

Run with your own PRD:

```
deno run -A main.ts my_prd.txt
```

The generated design document will be printed to the terminal.

---------------------------------------------------------------------

## Example Output (Shortened)

Below is a shortened example of the type of output the agent produces.

```
# 1. Problem and Context
Users currently upload receipts manually. This is slow and error-prone.

# 2. Use Cases and User Stories
- Upload a receipt
- Correct extracted metadata
- Search previous receipts

# 3. API Design
POST /receipts
GET /receipts
PUT /receipts/{id}
DELETE /receipts/{id}

# 4. Data Model
User, Receipt, Expense

# 5. System Flow
Upload -> Validate -> Extract -> Save

# 6. Non-Functional Requirements
Reliability, performance, security
```

---------------------------------------------------------------------

## How the Agent Works

The agent executes the following workflow:

1. Reads the PRD text from a local file
2. Constructs a structured task description
3. Sends the task to Zypher
4. Zypher streams model responses from Groq
5. Text chunks are aggregated into one output
6. The final Markdown design document is printed

This demonstrates a true task-based agent pipeline rather than a single LLM prompt.

---------------------------------------------------------------------

## Key Implementation Notes

The file `main.ts` includes:

- Environment variable loading
- Creating a Zypher context
- Configuring a Groq provider with OpenAIModelProvider
- Defining the structured task description
- Running the task and streaming the output
- Combining all streamed text into a final string

The implementation is intentionally simple and easy to extend.

---------------------------------------------------------------------

## Possible Extensions

This project can be expanded by adding:

- A web UI for uploading PRDs
- Exporting outputs to Markdown or PDF
- Additional agents (architecture agent, test plan agent, etc.)
- Mermaid or PlantUML diagram generation
- Integrations with Jira, Notion, or Confluence
