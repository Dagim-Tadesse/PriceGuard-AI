# Demo flow (2 minutes)

## Setup

- Start your backend API server.
- Confirm the backend base URL (example: `http://127.0.0.1:8000/api`).
- Use any REST client (curl, Postman) for the "add price" step.

## Flow

1. Add 3 prices for the same product (different days are fine).
   - `POST /api/prices/add/` with `{ product, location, price }`
2. Fetch the product list (latest price + trend/action).
   - `GET /api/prices/`
3. Open the product history.
   - `GET /api/prices/<product>/` (URL-encode spaces/special characters)
4. Show the prediction output.
   - `GET /api/prediction/<product>/`

## Expected

- Trend becomes `increasing|decreasing|stable`.
- Action becomes `buy_now|wait`.
- Responses are plain JSON (see `docs/api.md`).
