import json
import os
import django
from datetime import datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "priceguard.settings")
django.setup()

from api.models import Price

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

file_path = os.path.join(BASE_DIR, "../database/seed.json")

with open(file_path) as f:
    data = json.load(f)

for item in data:
    product = item["product"].lower()
    location = item["location"]

    for entry in item["prices"]:
        Price.objects.create(
            product=product,
            price=entry["price"],
            location=location,
            date=datetime.strptime(entry["date"], "%Y-%m-%d")
        )

print("Seed data loaded successfully")