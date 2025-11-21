# AI Product Requirements-to-Design Agent (Zypher)

This project is a small but realistic AI agent built with [Zypher](https://zypher.corespeed.io/) that turns a rough product idea or PRD into a structured, engineering-ready design document.

Given a text file with product requirements, the agent generates:

- Problem & context
- Key use cases and user stories
- REST-style API design (endpoints + JSON schemas)
- Data model (entities + fields + relationships)
- System behavior & flows
- Non-functional requirements
- Edge cases & failure scenarios
- Risks & open questions

It’s designed to show how Zypher can drive real product & engineering workflows, not just simple chat or summarization.

---

## Tech stack

- [Deno 2.x](https://deno.land/) as the runtime
- [`@corespeed/zypher`](https://zypher.corespeed.io/docs/quick-start) as the agent framework
- Anthropic Claude (`claude-sonnet-4-20250514`) as the LLM provider

---

## Project structure

```text
.
├─ main.ts          # Zypher agent entrypoint
├─ sample_prd.txt   # Example product requirements input
├─ .env.example     # Example environment variables (no secrets)
├─ deno.json        # Optional: Deno tasks for convenience
└─ README.md
