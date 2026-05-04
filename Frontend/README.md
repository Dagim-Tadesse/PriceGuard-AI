# Frontend

This folder contains the React + Vite client for PriceGuard-AI.

## What it does

The frontend is the product surface users interact with. It is responsible for:

- Login, signup, and local role switching for the demo flow.
- Displaying product cards, detailed price history, and prediction charts.
- Calling the backend API for profiles and curated price data.
- Talking to Supabase from the browser for auth and direct data reads where configured.

## Main stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Recharts
- Supabase Auth + REST

## Folder layout

- `src/screens/` - page-level flows like login, signup, dashboard, detail.
- `src/components/` - shared UI components.
- `src/services/` - API clients, auth helpers, price helpers.
- `src/state/` - app-wide state stores.
- `src/hooks/` - reusable hooks.
- `src/utils/` - small utility helpers.
- `src/test/` - frontend tests and fixtures.

## Important files

- `src/App.tsx` - app routing.
- `src/services/authService.ts` - signup/signin flow.
- `src/services/apiClient.ts` - backend API wrapper.
- `src/services/priceService.ts` - price and prediction requests.
- `src/state/stores.ts` - local auth and UI state.
- `vite.config.ts` - build config and env loading.

## How it communicates

The frontend uses two backends depending on the task:

- Supabase Auth for email/password signup and signin.
- Django REST API for user profiles and backend-managed operations.

Requests are JSON by default. The app expects:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL` or `VITE_BACKEND_BASE_URL`

## Data flow

1. User logs in or signs up.
2. Supabase confirms auth.
3. The frontend loads or creates the matching profile through the backend.
4. Dashboard and detail pages fetch prices and predictions.
5. Seller/admin actions send updates back to the API.

## Local development

```powershell
cd Frontend
npm install
npm run dev
```

The app usually runs at `http://127.0.0.1:5173`.

## What frontend developers should know

- Keep API shapes in sync with the backend serializers.
- Update the auth flow carefully; it touches Supabase, the backend, and local app state.
- If you change the backend URL, update the env variables used by `apiClient.ts` and `authService.ts`.
- Build output may be large; check `npm run build` after major UI changes.

## Notes

- Root deployment: https://price-guard-ai.vercel.app/
- The root README describes setup and project-wide architecture.
