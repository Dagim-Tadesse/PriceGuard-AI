Step 1 (Backend Engineer — unblock everything)

[Status: DONE]

Fix the broken AI import in services.py:
Backend currently expects ai.predictor.predict_price, but AI is in model.py.
Make backend call the real AI function (or create the expected module path).
Confirm endpoints return stable fields: product, price, location, trend, action and prediction endpoint returns trend, predicted_price, action, confidence, reason.

Verified:

- `GET /api/prices/` returns list of `{ product, price, location, trend, action }`
- `GET /api/prediction/<product>/` returns `{ trend, predicted_price, action, confidence, reason, current_price }`

Step 2 (AI/ML Engineer — make AI “callable” by backend)

[Status: DONE]

Ensure AI can be imported cleanly (no fragile relative imports).
Ensure predict_price() returns exactly what backend expects (keys and types).
Add “small data” behavior (already partially handled in backend service, but make AI consistent too).

Step 3 (Database/Data Engineer — enable demo data immediately)

[Status: DONE]

Run/verify seeding via load_seed.py using seed.json.
Confirm the data produces clear increasing/decreasing/stable examples for the demo.

Verified: DB contains seeded rows and distinct products; API returns 200s.

Step 4 (Frontend Engineer — wire UI to real backend)

[Status: DONE]

Update api.py to call the actual backend paths under /api/....
Update UI card in ui.py:
It currently expects item["prediction"] (doesn’t exist); should display trend + action (and optionally show predicted price on a separate view if you want).
Confirm Add Price page sends correct JSON keys (backend expects product, price, location per BackendReadme.md).

Verified:
- Add Price sends `{ product, price, location }` and shows validation errors if any.
- History page URL-encodes `<product>` (spaces/special chars).

Step 5 (You / PM — integration pass)

[Status: DONE]

Run the 2-minute demo flow end-to-end:
seed → list prices → add price → view history → view prediction
Then update api.md + demo.md to match the final reality (paths + response shapes).

Verified (live run):
- `GET /api/prices/` -> 200
- `POST /api/prices/add/` -> 200 (record created)
- `GET /api/prices/<product>/` -> 200 (history includes new record)
- `GET /api/prediction/<product>/` -> 200 (keys: action/trend/predicted_price/confidence/reason/current_price)

Quick run commands (Windows / PowerShell):

1. Backend: `python backend\priceguard\manage.py runserver 8000`
2. Frontend: `streamlit run Frontend\app.py`
