from api.models import Price, PriceBudgetUser
import json
import os
import sys
import django
from datetime import datetime
from django.utils import timezone

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "priceguard.settings")
django.setup()


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

file_path = os.path.join(BASE_DIR, "../database/seed.json")

with open(file_path) as f:
    data = json.load(f)

if Price.objects.exists():
    print("Seed skipped: prices table already has data.")
    print("If you want to re-seed, truncate the Supabase tables or run 'manage.py flush'.")
    raise SystemExit(0)

demo_users = [
    {"name": "Demo Buyer", "email": "buyer@priceguard.local",
        "role": PriceBudgetUser.ROLE_BUYER, "points": 25},
    {"name": "Demo Seller", "email": "seller@priceguard.local",
        "role": PriceBudgetUser.ROLE_SELLER, "points": 40},
    {"name": "Demo Admin", "email": "admin@priceguard.local",
        "role": PriceBudgetUser.ROLE_ADMIN, "points": 75},
]

for user in demo_users:
    PriceBudgetUser.objects.get_or_create(
        email=user["email"],
        defaults={
            "name": user["name"],
            "role": user["role"],
            "points": user["points"],
            "is_active": True,
        },
    )

for item in data:
    product = item["product"]  # preserve original casing
    location = item["location"]

    for entry in item["prices"]:
        Price.objects.create(
            product=product,
            price=entry["price"],
            location=location,
            source=Price.SOURCE_DEMO,
            date=timezone.make_aware(
                datetime.strptime(entry["date"], "%Y-%m-%d"),
                timezone.get_current_timezone(),
            )
        )

print("Seed data loaded successfully")
