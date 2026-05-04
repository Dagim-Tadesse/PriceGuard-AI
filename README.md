# PriceGuard-AI

PriceGuard-AI helps buyers, sellers, and admins track product prices, inspect history, and get a simple recommendation: buy now or wait.

Live deployment: https://price-guard-ai.vercel.app/

The project is organized around a clean split between frontend, backend, AI logic, and database schema.

## Project layout

- `Frontend/` - React + Vite client.
- `backend/` - Django REST API and server-side business logic.
- `Ai/` - lightweight prediction and trend logic.
- `database/` - schema, RLS, and seed data.
- `docs/` - API, architecture, demo, and setup notes.

## What each part does

- Frontend: renders the UI, handles auth, and calls the API.
- Backend: validates requests, serves JSON, and applies server-side rules.
- AI: turns historical price data into trend and recommendation fields.
- Database: stores users, price rows, and point history.

Each folder now has its own README with the details a contributor needs.

## Main runtime stack

- Frontend: React, TypeScript, Vite, TanStack Query, Recharts.
- Backend: Django, Django REST Framework, CORS middleware.
- Database: Supabase Postgres with prefixed tables.
- Auth: Supabase Auth for email/password accounts.

## How the system fits together

1. The frontend signs users in through Supabase Auth.
2. The backend stores and serves user profiles and price operations.
3. The database stores the source data for charts, history, and points.
4. The AI layer reads price history and returns trend/action guidance.

## Core database tables

- `pricebudget_users` - profiles for buyer, seller, and admin users.
- `pricebudget_prices` - product price history rows.
- `pricebudget_points_ledger` - audit trail for point changes.

## Local setup

1. Install dependencies.
2. Set your environment variables in repo-root `.env`.
3. Run database migrations.
4. Start the backend on port `8000`.
5. Start the frontend on port `5173`.

```powershell
python backend/manage.py migrate
python backend/manage.py runserver 127.0.0.1:8000
cd Frontend
npm install
npm run dev
```

## Environment variables

Frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL` or `VITE_BACKEND_BASE_URL`

Backend:

- `DATABASE_URL` or `SUPABASE_DATABASE_URL`
- `DJANGO_SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `DB_SSL_REQUIRE`

## Quick checks

- Backend API: `http://127.0.0.1:8000/api/users/`
- Frontend dev app: `http://127.0.0.1:5173`
- Deployed app: https://price-guard-ai.vercel.app/

## Development notes

- Keep API response shapes stable; the frontend depends on them.
- Keep RLS and CORS aligned with the active frontend origin.
- If the dashboard looks empty, confirm the seed data and schema policies were applied.
- If you update the prediction output, keep the existing keys so the UI does not break.

## Documentation map

- Backend guide: [backend/README.md](backend/README.md)
- Frontend guide: [Frontend/README.md](Frontend/README.md)
- AI guide: [Ai/README.md](Ai/README.md)
- Database guide: [database/README.md](database/README.md)

## Notes

This README is the main entry point for the repository. The folder-level READMEs are the working handbooks for each subsystem.

If CI fails due to CORS or host issues, see `docs/cors.md` for local development tips.

## What makes this different

- Demo-first reliability: one-command setup, reset/seed scripts, and smoke-tested API flow.
- Explainable recommendations: each prediction includes trend, confidence, action, and plain-English reason.
- Practical UX for decisions: dashboard summary, filters, comparison by location, watchlist, and alerts.
- Fast local reproducibility: pinned dependencies and CI checks for frontend + backend.

## How the AI recommendation works

The backend prediction endpoint combines recent price history with lightweight logic in `Ai/model.py`.

At a high level:

1. Fetch product history from the backend database.
2. If data is insufficient, return a safe fallback response with a clear reason.
3. If enough data exists, estimate short-term movement and derive:
   - `trend` (`increasing`, `decreasing`, `stable`)
   - `predicted_price`
   - `action` (`buy_now` or `wait`)
   - `confidence`
   - `reason` (plain-English explanation)

This is optimized for interpretability and demo reliability rather than heavy model complexity.

## Troubleshooting

- Backend not reachable from frontend
  - Ensure Django is running on port `8000`.
  - Run: `\.venv\Scripts\python.exe backend\priceguard\manage.py runserver 8000`

- Frontend command not found
  - Ensure Node.js is installed.
  - From `Frontend/`, run `npm install` once, then `npm run dev`.

- CORS or `DisallowedHost` errors
  - Review `docs/cors.md` and add required origins/hosts.

- Empty dashboard data
  - Reset and reseed demo data:
  - `\.\scripts\reset-demo.ps1`

- Prediction unavailable for a product
  - Add more price entries for that product; sparse history returns a safe fallback.

- Verify backend quickly
  - Run unit tests: `\.venv\Scripts\python.exe backend\priceguard\manage.py test`
  - Run smoke test: `\.venv\Scripts\python.exe scripts\smoke_test.py`

## Presenter resources

- One-page demo guide: `docs/demo-script.md`
- Architecture overview: `docs/architecture.md`
