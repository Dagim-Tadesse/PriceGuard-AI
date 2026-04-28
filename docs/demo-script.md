# One-Page Demo Script (Presenter Guide)

This script is designed for a 90-120 second hackathon demo of PriceGuard-AI.

## 0. Setup checklist (30 seconds before presenting)

- Backend running at `http://127.0.0.1:8000`
- Frontend running via Streamlit (`Frontend/app.py`)
- Fresh demo data loaded (`scripts/reset-demo.ps1`)
- Open browser tabs:
  - Dashboard (`/`)
  - Product History page
  - Product Detail page

## 1. Opening (10-15 seconds)

Say:

"PriceGuard-AI helps buyers avoid overpaying by tracking prices over time, comparing locations, and predicting short-term trend changes with an explainable recommendation."

Show:

- The hero/value statement on the dashboard.
- The summary metrics (tracked products, increasing trends, buy-now signals).

## 2. Show live market overview (15-20 seconds)

Action:

- Use search/filter to focus on one product.
- Point to trend and action labels on product cards.

Say:

"In one view, we can quickly spot products that are rising, stable, or dropping and whether the system suggests buy now or wait."

## 3. Show comparison across locations (15-20 seconds)

Action:

- Open the Compare page.
- Select a product.
- Highlight cheapest vs most expensive location and price gap chart.

Say:

"PriceGuard-AI compares the same product across locations, so users can immediately find where to buy at the lowest price."

## 4. Show trend history + AI prediction (20-25 seconds)

Action:

- Open History or Detail page for the same product.
- Show line chart and prediction panel.
- Point to: predicted price, trend, buy/wait action, confidence, and plain-English reason.

Say:

"The model does not just output a number; it explains the recommendation and confidence so users can trust the decision quickly."

## 5. Show live update (20-25 seconds)

Action:

- Open Add Price page.
- Add a realistic new price entry.
- Return to dashboard/history and show updated trend behavior.

Say:

"This is real-time demo flow: once new data is added, the dashboard and insights update immediately."

## 6. Close (10-15 seconds)

Say:

"PriceGuard-AI turns noisy market prices into clear buy/wait decisions in seconds. It is fast to set up, robust for demos, and easy to extend for real deployments."

## Presenter fallback lines (if something goes wrong)

- If backend is down: "The app has explicit failure states and clear error messages; let me restart backend quickly using the setup scripts."
- If prediction unavailable: "For sparse history, the system safely reports insufficient data instead of producing misleading output."
- If asked about reliability: "We added backend unit tests, an API smoke test, idempotent seeding, and CI checks."
