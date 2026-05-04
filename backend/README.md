# Backend

This folder contains the Django REST API for PriceGuard-AI.

## What it does

The backend is the server-side control plane for the app. It is responsible for:

- Serving JSON endpoints for prices, history, predictions, and user profiles.
- Reading and writing the core `pricebudget_*` tables through Django models.
- Applying server-side business rules, validation, and role-aware actions.
- Connecting the UI to the AI layer in `Ai/` when a prediction is requested.

## Main stack

- Django 6
- Django REST Framework
- `django-cors-headers`
- `dj-database-url`
- PostgreSQL via Supabase in production, SQLite locally for quick dev work

## Folder layout

- `priceguard/` - Django project settings, URLs, and WSGI entrypoint.
- `api/` - application code for models, serializers, views, services, and tests.

## Important files

- `priceguard/priceguard/settings.py` - environment loading, CORS, database config, logging.
- `priceguard/priceguard/urls.py` - root URL router.
- `priceguard/api/models.py` - database models for users, prices, and point ledger.
- `priceguard/api/serializers.py` - request/response validation.
- `priceguard/api/views.py` - HTTP endpoints.
- `priceguard/api/services.py` - business logic and AI orchestration helpers.
- `priceguard/api/tests.py` - endpoint smoke tests.

## How it communicates

The backend only speaks HTTP JSON to the frontend.

- Frontend requests hit `/api/*` endpoints.
- Responses are JSON objects or arrays.
- `CORS_ALLOWED_ORIGINS` must include the Vite dev server or the deployed frontend domain.
- `ALLOWED_HOSTS` must include local hosts and production hostnames.

When the frontend creates or updates data, it calls these backend routes instead of touching the database directly.

## API surface

Common endpoints:

- `GET /api/prices/` - latest prices with trend/action summary.
- `POST /api/prices/add/` - create a new price row.
- `GET /api/prices/<product>/` - full price history for one product.
- `GET /api/prediction/<product>/` - AI prediction payload.
- `GET /api/users/` - list user profiles.
- `POST /api/users/` - create a profile record.
- `POST /api/users/<id>/award-points/` - adjust points and write a ledger row.

## Data flow

1. Frontend submits a request.
2. Django validates and normalizes the input.
3. The model/service layer reads or writes Supabase-backed tables.
4. The AI helper calculates trend and action fields when needed.
5. Django returns a compact JSON payload for the UI.

## Local development

1. Activate the Python environment.
2. Make sure `.env` contains `DATABASE_URL`.
3. Run migrations.
4. Start the server on port `8000`.

```powershell
python backend/manage.py migrate
python backend/manage.py runserver 127.0.0.1:8000
```

## What backend developers should know

- Keep serializers strict; the frontend expects predictable response shapes.
- Keep role checks server-side when adding seller/admin-only actions.
- Prefer service functions over putting complex logic directly in views.
- Keep CORS and host settings aligned with the deployed frontend and local dev server.
- If the frontend shows `Failed to fetch`, verify the backend is running, reachable, and allowed by CORS.

## Notes

- The root README is the project entry point.
- This file is the backend-specific handbook for day-to-day development.