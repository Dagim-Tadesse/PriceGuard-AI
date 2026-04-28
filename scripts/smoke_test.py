import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend", "priceguard")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "priceguard.settings")

import django  # noqa: E402

django.setup()

from django.conf import settings  # noqa: E402
from django.test import Client  # noqa: E402

settings.ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]


def main():
    client = Client()

    print("Running smoke test...")

    prices_response = client.get("/api/prices/")
    assert prices_response.status_code == 200, prices_response.content
    prices = json.loads(prices_response.content)
    assert isinstance(prices, list), prices
    print(f"list ok: {len(prices)} items")

    if not prices:
        raise SystemExit(
            "No demo products available to test history/prediction flows.")

    product = prices[0]["product"]

    add_response = client.post(
        "/api/prices/add/",
        data=json.dumps({
            "product": product,
            "price": float(prices[0]["price"]) + 1,
            "location": prices[0]["location"],
        }),
        content_type="application/json",
    )
    assert add_response.status_code == 201, add_response.content
    print("add price ok")

    history_response = client.get(f"/api/prices/{product}/")
    assert history_response.status_code == 200, history_response.content
    history = json.loads(history_response.content)
    assert isinstance(history, list) and len(history) >= 1, history
    print(f"history ok: {len(history)} rows")

    prediction_response = client.get(f"/api/prediction/{product}/")
    assert prediction_response.status_code == 200, prediction_response.content
    prediction = json.loads(prediction_response.content)
    for key in ["trend", "predicted_price", "action", "confidence", "reason"]:
        assert key in prediction, prediction
    print("prediction ok")
    print("smoke test passed")


if __name__ == "__main__":
    main()
