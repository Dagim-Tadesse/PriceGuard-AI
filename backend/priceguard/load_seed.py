import json
import os
import sys
import django
from datetime import datetime

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "priceguard.settings")
django.setup()

from api.models import Price


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

file_path = os.path.join(BASE_DIR, "../database/seed.json")

with open(file_path) as f:
    data = json.load(f)

if Price.objects.exists():
    print("Seed skipped: prices table already has data.")
    print("If you want to re-seed, delete backend/priceguard/db.sqlite3 or run 'manage.py flush'.")
    raise SystemExit(0)

for item in data:
    product = item["product"]  # preserve original casing
    location = item["location"]

    for entry in item["prices"]:
        Price.objects.create(
            product=product,
            price=entry["price"],
            location=location,
            date=datetime.strptime(entry["date"], "%Y-%m-%d")
        )

print("Seed data loaded successfully")
