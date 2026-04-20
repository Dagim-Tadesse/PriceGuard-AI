\# Architecture

This project is split by responsibility, but integrates through **stable contracts**.

\## Components

- Frontend
  - Renders product list, add-price form, history view, prediction view
  - Calls backend endpoints defined in \`docs/api.md\`

- Backend API
  - Validates input
  - Persists product + price history
  - Calls AI/prediction logic
  - Returns consistent JSON envelopes

- AI / Prediction
  - Consumes price history
  - Outputs \`{ trend, predicted_price, action, confidence, reason }\`

\## Data flow

1. User submits price (Frontend → \`POST /api/prices/\`)
2. Backend stores price history
3. Frontend fetches list/history/prediction
4. Backend returns trend + action in a stable format
