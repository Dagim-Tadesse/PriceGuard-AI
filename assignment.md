Title and collect datas

1.1 Background / introduction

PriceGuard-AI is a prototype system that tracks product prices across locations and time, uses historical data and a lightweight predictive model to estimate near-term price movement, and presents actionable insights via a Streamlit dashboard. The project bundles a Django REST API backend that ingests and serves price records, a Streamlit frontend for visualization and interaction, and an AI component (a simple predictive model located in `Ai/model.py`) that provides price direction, expected change, and a confidence score.

The system is designed as a hackathon-ready demo: easy local setup (venv + seeds), reproducible dependencies, basic unit and smoke tests, and clear UI flows (dashboard, product detail, comparison, watchlist, alerts, CSV export). The main goal is to help small retailers and shoppers quickly identify unusually high prices, the best time to buy, and forecast near-term price trends.

1.2 Statement of the Problem

Retailers and consumers often face noisy, sparse, and geographically-distributed pricing information. Manually monitoring prices across stores and time is time-consuming; naive aggregation misses temporal patterns and sudden spikes. The concrete problems PriceGuard-AI addresses:

- Lack of automated, timely signals for price spikes and drops across multiple locations.
- Difficulty in comparing the same product across different stores with inconsistent naming and sparse sampling.
- No lightweight, interpretable near-term forecast (direction + magnitude + reason) to inform buy/sell or promotion decisions.
- Inaccessible demo setups: many research prototypes are hard to deploy or reproduce for stakeholders.

  1.3 Objectives

  1.3.1 General

- Build a reproducible, demo-ready system that collects price records, serves them via REST APIs, displays intuitive visualizations in a frontend, and provides simple AI-driven forecasts and actionable recommendations.

  1.3.2 Specific

- Implement a reliable seed and reset flow so a complete demo can be launched with one command.
- Provide a REST API to list products, submit price records, fetch price history, and request a prediction for a product-location pair.
- Produce frontend visualizations: dashboard metrics, time-series charts, comparisons across locations, and detail pages with export options.
- Create an AI prediction interface that returns: predicted direction (up/down/stable), expected percent change, and a short human-readable reason and confidence value.
- Surface friendly failure states (backend unavailable, empty datasets) and guard rails for small-data situations (e.g., single datapoint).
- Add unit tests and a smoke test to validate core paths during CI and local runs.

2. Related work/ literature review

- Price surveillance and anomaly detection: Many systems use time-series anomaly detection (e.g., seasonal hybrid ESD, Prophet, ARIMA, STL decomposition) to identify unusual price movements. For sparse retail pricing, robust change-point detection techniques and median-based smoothing are commonly used to reduce noise from occasional mis-entries.

- Forecasting methods in commerce: Classical time-series models (SARIMA) give interpretable trends for strongly seasonal data; Prophet provides ease-of-use and holiday effects. For short-horizon forecasts with sparse data, lightweight regression or gradient-boosted trees on time-window features often outperform complex recurrent nets when training resources are limited.

- Price comparison platforms and scraping tools: Commercial price-comparison engines focus on large-scale scraping and canonicalization. Academic work highlights the importance of entity resolution (matching the same product across sellers) and handling missingness in observational pricing data.

- Explainability: Methods such as SHAP values and simple rule-based heuristics help produce human-readable reasons for predictions ("recent 3-day average jumped 7% vs. 30-day median"). Combining simple statistical checks with a small model often yields useful reasons for demo scenarios.

This project takes inspiration from these approaches but emphasizes reproducibility, interpretability, and a demo-first engineering trade-off: small models, deterministic seed data, and UX-centric outputs.

3. Methodology

3.1 Datasets (source, validation, training, test data, preprocessing)

- Data sources
  - Demo seed data: stored under `database/seed.json`. This synthetic dataset contains a small number of products (e.g., 3–10), multiple locations, and sampled price records across recent dates to exercise time-series charts and the prediction logic.
  - Ingestion API: `POST /api/prices/add/` accepts new price records. In production, this could be replaced with a scraper or vendor feed; for the demo, manual or scripted entries simulate incoming data.

- Data schema
  - Each price record has: timestamp (ISO 8601), product_name (string), location (string), price (decimal), optional metadata (currency, unit, notes).
  - The database uses Django ORM models stored in `backend/priceguard` with an index on (`product_name`, `location`, `timestamp`) for efficient history queries.

- Splits: training / validation / test
  - Because the current AI component is small and the demo dataset tiny, the system uses a pragmatic split strategy for model evaluation:
    - Training: All historical points up to a cutoff date (e.g., all points except the last 7 days).
    - Validation: The next short window (e.g., last 7–3 days) used for hyperparameter checks when applicable.
    - Test: The most recent days (e.g., last 3 days) used to compute an out-of-sample simple accuracy and error metrics for reporting.
  - For production-grade datasets, use time-based rolling-window validation (walk-forward validation) to better estimate real-world performance.

- Preprocessing steps
  - Normalization/Canonicalization: Normalize `product_name` and `location` strings (trim, lower-case, remove special characters) for grouping; optionally apply a lightweight fuzzy matching step to merge near-duplicates.
  - Timestamp handling: Convert incoming timestamps to timezone-aware `datetime` objects using Django's timezone utilities; store UTC in the DB and present localized times in the frontend.
  - Missing values: Drop or flag records with missing price or timestamp. If sparse sampling is detected for a product-location pair (< 2 records), return an explanatory prediction response rather than running a model.
  - Outlier trimming: For historical features, cap per-day prices to reasonable percentiles (e.g., 1st–99th) to reduce the impact of data entry errors; optionally mark records flagged as outliers in the UI.
  - Feature engineering: Create short-horizon features such as recent percent change (3-day, 7-day), rolling mean/median, volatility (stddev) over last N days, time-since-last-observation, day-of-week and hour-of-day embeddings if sampling supports them.

- Data validation
  - API-level validation: Use DRF serializers to validate fields (price > 0, timestamp parseable, known currency/unit if enforced).
  - Seed idempotency: The seed loader checks whether data already exists to avoid duplicate seed runs.
  - Test data generation: Unit tests and smoke tests create ephemeral DB states to validate API endpoints and prediction behavior.

  3.2 Techniques

- Model & prediction strategy
  - Heuristic baseline: For the demo, predictions often fall back to a heuristic rule engine when data is sparse. Heuristics may include recent percent-change thresholds and volatility checks to recommend `BUY`, `WAIT`, or `SELL` style actions.
  - Lightweight ML model: When enough data exists, a small regression model (e.g., XGBoost/LightGBM or scikit-learn GradientBoostingRegressor) trained on engineered features (recent percent changes, rolling means, volatility, time since last observation) predicts the expected percent change in the near-term horizon (e.g., next 3–7 days).
  - Classification fallback: Alternatively, a simple classifier (logistic regression / random forest) predicts direction: up / stable / down.
  - Explainability: For tree-based models use SHAP summary values to produce a short textual reason (e.g., "recent 7-day price up 6% vs. 30-day median"), plus confidence approximated by model output distribution or a calibrated probability. When using heuristics, the reason is the triggered rule.

- Evaluation metrics
  - Regression metrics: MAE (mean absolute error), RMSE, and MAPE (mean absolute percentage error) for percent-change forecasts.
  - Classification metrics: accuracy, precision/recall per direction class; confusion matrices for up/stable/down.
  - Business metrics: alert precision (fraction of signaled spikes that are real), and lead time (how early the model flags a decline or spike before ground truth).

- System architecture and engineering decisions
  - Backend: Django REST Framework provides API endpoints for product listing, history retrieval, price ingestion, and prediction requests. Business logic and prediction orchestration live in `backend/priceguard/api/services.py`.
  - Frontend: Streamlit app offers the dashboard, filters, comparison and detail pages, and CSV export. App code is structured into `Frontend/app.py`, `Frontend/pages/`, and `Frontend/utils/` for modularity.
  - AI module: A lightweight Python module (`Ai/model.py`) exposes a `predict_price()` function that accepts a pandas DataFrame of recent price records and returns a structured result: predicted_change_pct, direction, confidence, reason_text. This function is intentionally small to keep dependencies manageable for a demo.
  - Testing: Django `TestCase` units cover core API behavior; a smoke test script exercises the end-to-end flow in CI.

- Experimental setup
  - Baseline experiments compare: (A) heuristic-only, (B) small tree-based regressor on engineered features, and (C) simple time-series smoothing (e.g., exponential smoothing) as a second baseline. Use the demo seed and synthetic augmented datasets for quick iteration.
  - For each experiment record training configuration, features used, and evaluation metrics on a held-out test window.

- Deployment and reproducibility
  - Dependencies are pinned in a `requirements.txt` for reproducible environments; `scripts/setup.ps1` and `scripts/reset-demo.ps1` provide one-command setup and reseeding locally.
  - For CI, add a lightweight GitHub Actions workflow that runs the Django tests and smoke test to ensure regressions are caught early.

- UX & safety considerations
  - Friendly failure states: When predictions are unavailable (insufficient data) the API returns a structured reason and the frontend surfaces a clear message rather than an error dialog.
  - Rate limiting & validation: For a demo, API rate limiting is not enforced, but in production implement simple throttles and authentication to avoid spam.
  - Data privacy: The demo uses synthetic or user-provided non-sensitive pricing data. For any real deployment, ensure no PII is collected and follow local regulations for data retention.

Appendix: Implementation notes and next steps

- To extend the dataset for more robust ML experiments:
  - Add scripted synthetic generators that vary price seasonality, sudden promotions, and sporadic missingness.
  - Integrate lightweight entity resolution (fuzzy matching) when multiple sellers use inconsistent product descriptions.

- For production-readiness:
  - Add CORS configuration and documented host/origin examples for running frontend and backend on separate ports.
  - Implement persistent watchlists and alerts (backend-backed) and add authentication.
  - Improve logging and structured tracing for model predictions to support monitoring of model drift and alert precision metrics.

This document describes the current hackathon-focused project architecture, goals, data handling, model choices, and evaluation plan. It can be used as an assignment specification or project README appendix to guide development, testing, and demo preparation.
