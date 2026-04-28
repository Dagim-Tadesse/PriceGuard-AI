# PriceGuard-AI Hackathon Polish Backlog

Goal: turn the working MVP into a demo that feels reliable, polished, and memorable in under 2 minutes.

## P0 - Must Fix Before Demo

- [x] Add a single setup command or script so the app can be started fast on a fresh machine.
- [x] Add a `requirements.txt` so the environment is reproducible.
- [x] Add a short "run locally" section in the README with exact backend and frontend commands.
- [x] Add a reset/seed command for demo data so the database can be restored quickly.
- [x] Make empty-state and error-state UI friendly in the frontend.
- [x] Make API errors return clear messages that the frontend can display.
- [x] Verify all endpoints return the same field names the UI expects.
- [x] Make sure the demo still works after a database reset.

Verified:

- `scripts/setup.ps1` installs deps, runs migrations, and seeds demo data.
- `scripts/reset-demo.ps1` flushes and re-seeds the database.
- Frontend API errors now show a clear message when the backend is down or returns validation errors.
- Empty product/history states now render as friendly UI states instead of hard errors.
- Backend `GET /api/prices/` returns `[]` on an empty database, so the demo can recover cleanly after a reset.

## P1 - High-Impact Demo Polish

- [x] Add price trend charts for each product instead of only tables.
- [x] Show the prediction result as a visual card with:
  - [x] predicted price
  - [x] trend
  - [x] buy/wait action
  - [x] confidence score
  - [x] plain-English reason
- [x] Add a dashboard summary section with 3 quick stats:
  - [x] number of tracked products
  - [x] number of increasing trends
  - [x] number of buy-now recommendations
- [x] Add a search or filter box for products and locations.
- [x] Improve the home screen spacing, typography, and visual hierarchy.
- [x] Make the UI feel branded with a consistent color palette and title style.
- [x] Add a more compelling landing/header section that explains the value in one sentence.

Verified:

- Dashboard now shows tracked product count, increasing trends, and buy-now signals.
- Dashboard now includes search and filter controls for product, location, and trend.
- The home screen uses a branded hero banner and improved card spacing.
- History page now shows a trend chart and a prediction panel with price, trend, action, confidence, and reason.
- Dashboard header now explains the value in one sentence.

## P1 - Product Features That Impress Judges

- [x] Add a watchlist/favorites feature for important products.
- [x] Add comparison view for the same product across multiple locations.
- [x] Add alerts for sharp price increases.
- [x] Add a "best time to buy" insight based on trend history.
- [x] Add a product detail page that combines history, trend, and prediction in one place.
- [x] Add export/share support for the demo view.

Verified:

- Dashboard now has a watchlist sidebar and per-product add/remove buttons.
- Comparison view now shows the cheapest location, price gap, bar chart, and latest price table for a selected product.
- Dashboard now shows sharp price alerts when a product jumps by more than 8%.
- Detail page now bundles history, prediction, best-time-to-buy guidance, CSV download, and share text.

## P2 - Trust and Reliability Polish

- [x] Add basic automated tests for backend endpoints.
- [x] Add a small smoke test script that checks list, history, prediction, and add-price flows.
- [x] Add request logging or debug logging for AI predictions.
- [x] Add graceful handling for missing product history.
- [ ] Add CORS/config notes if frontend and backend are run separately.
- [x] Keep the seed data idempotent so running it twice does not duplicate records.
- [x] Remove tracked build artifacts from git and keep caches ignored.

- [x] Add CORS/config notes if frontend and backend are run separately.

Verified:

- `manage.py test api` passes.
- `scripts/smoke_test.py` passes and exercises list, add-price, history, and prediction flows.
- Prediction lookups now log request and completion details for easier debugging.
- `docs/cors.md` added with local dev and ALLOWED_HOSTS guidance.
- `.github/workflows/ci.yml` added to run unit tests and the smoke test in CI.

Verified:

- Backend tests cover list, history, prediction, and add-price endpoints.
- `scripts/smoke_test.py` exercises the API flows end-to-end with Django's test client.

## P2 - Documentation Polish

- [x] Add a one-page demo script for presenters.
- [x] Add screenshots or a short GIF of the UI.
- [x] Add a simple architecture diagram.
- [x] Add a "what makes this different" section in the README.
- [x] Add a short explanation of how the AI makes its recommendation.
- [x] Add a short troubleshooting section for common setup issues.

Verified:

- `docs/demo-script.md` added as a one-page presenter guide.
- `docs/architecture.md` now includes a simple Mermaid diagram.
- `README.md` now includes sections for differentiation, AI explanation, and troubleshooting.
- `docs/assets/dashboard.png` captured and linked in `README.md`.

## P3 - Stretch Goals If Time Remains

- [x] Add lightweight authentication or a demo login.
- [ ] Add a deployment link or hosted demo.
- [ ] Add push notifications or email alerts.
- [x] Add role-based views for buyer, seller, or admin.
- [x] Add a map or region-based price overview.
- [x] Add a local language or accessibility-friendly mode.

Verified:

- Streamlit dashboard now includes an accessibility mode toggle with higher contrast and larger typography.
- Streamlit dashboard now includes buyer, seller, and admin role views with role-specific summary guidance.
- Comparison page now includes a region overview with inferred region grouping and average price chart.
- Streamlit dashboard now requires a demo login before showing the main view.

## Winning Demo Script

1. Open the dashboard.
2. Show the product trend cards and the buy/wait recommendation.
3. Add a new price and show the trend update instantly.
4. Open history for one product and point to the pattern.
5. Open prediction and explain the reason in one sentence.
6. End with the value statement: PriceGuard helps people buy at the right time and avoid overpaying.

## Definition of Done for Hackathon

- The app starts cleanly on a fresh machine.
- The UI feels intentional and polished.
- The demo works end-to-end without manual fixes.
- The prediction output is easy to understand in seconds.
- Judges can see the impact immediately.
