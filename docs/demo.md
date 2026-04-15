# Demo flow (2 minutes)

## Setup

- Start your backend API server.
- Confirm the backend base URL (example: `http://127.0.0.1:8000/api`).
- Use any REST client (curl, Postman) for the "add price" step.

## Flow

1. Add 3 prices for the same product (different days are fine).
   - `POST /api/prices/` with `{ product_name, location, price }`
2. Fetch the product list.
   - `GET /api/products/`
   - Show: latest price + trend + action
3. Open the product history.
   - `GET /api/products/{id}/history/`
4. Show the prediction output.
   - `GET /api/products/{id}/prediction/`

## Expected

- Trend becomes `increasing|decreasing|stable`.
- Action becomes `buy_now|wait`.
- Response envelope is consistent for all endpoints.
