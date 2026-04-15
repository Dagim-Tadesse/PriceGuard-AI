\# PriceGuard-AI

Build a system that tracks product prices, shows price history, and returns a simple recommendation: **buy now** vs **wait**.

This repo is intentionally **contract-first**: we define shared formats first, then each engineer can implement in the tools they prefer.

\## What is fixed (must not change silently)

- API contract: \`docs/api.md\`
- Demo flow: \`docs/demo.md\`
- Contribution rules: \`CONTRIBUTING.md\`

\## Repo structure

- \`Frontend/\` — UI implementation (any stack)
- \`backend/\` — API implementation (any stack)
- \`Ai/\` — prediction/trend implementation (any stack)
- \`docs/\` — contracts and integration notes

\## First team goal

Implement the endpoints in \`docs/api.md\` and make the demo flow in \`docs/demo.md\` pass end-to-end.
