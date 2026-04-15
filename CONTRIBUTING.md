# Contributing

## Branching

- Use short branches: `feat/<area>-<summary>`, `fix/<area>-<summary>`, `chore/<summary>`
- Open PRs early; keep PRs focused.

## Contracts (do not break silently)

- API contract is defined in `docs/api.md`.
- Do not change endpoint paths, required fields, or response shapes without agreement.
- Keep a stable response envelope:
  - Success: `{ "ok": true, "data": ... }`
  - Error: `{ "ok": false, "error": { "code", "message", "details?" } }`

## Backend conventions (framework-agnostic)

- Validate inputs at the boundary (request parsing / schema validation).
- Keep handlers/controllers thin: validate → call business logic → return envelope.
- Avoid breaking changes: if you must change the contract, update `docs/api.md` and coordinate with the team.

## AI conventions

- AI output contract is: `{ trend, predicted_price, action, confidence, reason }`
- Allowed `trend`: `increasing` | `decreasing` | `stable`
- Allowed `action`: `buy_now` | `wait`

## Demo-first

- Prefer simple, working implementations over over-optimization.
