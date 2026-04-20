## What changed?

-

## Why?

-

## How to test

- [ ] Backend: run your backend's test/lint/check command
- [ ] Backend: add a price via `POST /api/prices/`
- [ ] Backend: verify `/api/products/` returns `trend` + `action`
- [ ] Frontend: verify screens still render

## Contract checklist

- [ ] No breaking changes to `docs/api.md` without team agreement
- [ ] Response envelope stays `{ ok, data }` or `{ ok, error }`
- [ ] Error codes/messages are consistent
