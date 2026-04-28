from django.test import TestCase
from urllib.parse import quote

from .models import Price


class ApiEndpointTests(TestCase):
    def setUp(self):
        Price.objects.create(
            product="Cooking Oil (5L)",
            price=950,
            location="Bole Supermarket",
        )
        Price.objects.create(
            product="Cooking Oil (5L)",
            price=980,
            location="Merkato Open Market",
        )
        Price.objects.create(
            product="Cooking Oil (5L)",
            price=1050,
            location="Bole Supermarket",
        )

    def test_get_prices_returns_latest_products(self):
        response = self.client.get("/api/prices/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

        item = response.json()[0]
        self.assertEqual(item["product"], "Cooking Oil (5L)")
        self.assertEqual(item["location"], "Bole Supermarket")
        self.assertIn(item["trend"], ["increasing", "decreasing", "stable"])
        self.assertIn(item["action"], ["buy_now", "wait"])

    def test_get_history_returns_entries(self):
        response = self.client.get(f"/api/prices/{quote('Cooking Oil (5L)')}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 3)

    def test_get_prediction_returns_ai_fields(self):
        response = self.client.get(
            f"/api/prediction/{quote('Cooking Oil (5L)')}/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("trend", payload)
        self.assertIn("predicted_price", payload)
        self.assertIn("action", payload)
        self.assertIn("confidence", payload)
        self.assertIn("reason", payload)

    def test_add_price_creates_record(self):
        response = self.client.post(
            "/api/prices/add/",
            data={
                "product": "Tomatoes (1kg)",
                "price": 45,
                "location": "Merkato Open Market",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Price.objects.filter(
            product="Tomatoes (1kg)").count(), 1)

    def test_accepts_requests_with_origin_header(self):
        # Simulate frontend origin; should not error even if CORS isn't configured
        response = self.client.get(
            "/api/prices/", HTTP_ORIGIN='http://localhost:8501')
        self.assertEqual(response.status_code, 200)

    def test_accepts_requests_with_custom_host(self):
        # Ensure requests with a common host header don't trigger DisallowedHost
        response = self.client.get("/api/prices/", HTTP_HOST='localhost')
        self.assertEqual(response.status_code, 200)
