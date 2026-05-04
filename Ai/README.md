# AI

This folder contains the lightweight price-analysis and prediction logic for PriceGuard-AI.

## What it does

The AI layer turns historical price rows into a simple decision signal for the product UI.

It is responsible for:

- Detecting short-term trend direction.
- Estimating a near-future price.
- Producing a recommendation such as `buy_now` or `wait`.
- Returning a plain-English reason the UI can display.

## Main files

- `model.py` - core trend/prediction logic.
- `utils.py` - shared helpers used by the model or services.
- `data/` - optional local data assets, experiments, or demo inputs.

## How it is used

The backend calls this layer when a prediction endpoint is requested. The flow is:

1. Backend fetches product history.
2. AI code inspects recent rows.
3. AI returns trend, predicted price, action, confidence, and reason.
4. Backend formats the result as JSON for the frontend.

## Design goals

- Keep it interpretable, not black-box.
- Keep outputs stable for demos.
- Prefer deterministic logic over heavy training dependencies.
- Make fallback behavior safe when there is not enough data.

## Developer notes

- The AI layer should not depend on browser code.
- Keep it importable from Django without extra runtime setup.
- If you add richer forecasting later, preserve the existing response keys so the UI does not break.

## Useful expectations

The rest of the app expects prediction payloads to include:

- `trend`
- `predicted_price`
- `action`
- `confidence`
- `reason`

If you change any of those fields, update the backend serializer/service and the frontend UI together.
