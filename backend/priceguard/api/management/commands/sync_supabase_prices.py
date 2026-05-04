from django.core.management.base import BaseCommand
import os
import requests
from dateutil import parser as dateparser


class Command(BaseCommand):
    help = "Sync prices from Supabase REST into the local Price model"

    def add_arguments(self, parser):
        parser.add_argument("--table", default="prices", help="Supabase table name to fetch")

    def handle(self, *args, **options):
        SUPA_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
        SUPA_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
        table = options.get("table")

        if not SUPA_URL or not SUPA_KEY:
            self.stderr.write("SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_* equivalents) must be set in the environment")
            return

        endpoint = f"{SUPA_URL.rstrip('/')}/rest/v1/{table}"
        headers = {
            "apikey": SUPA_KEY,
            "Authorization": f"Bearer {SUPA_KEY}",
            "Accept": "application/json",
        }

        self.stdout.write(f"Fetching rows from Supabase table: {table}")
        resp = requests.get(endpoint, headers=headers, params={"select": "*"}, timeout=30)
        resp.raise_for_status()
        rows = resp.json()
        self.stdout.write(f"Fetched {len(rows)} rows")

        # Import into local Django models
        from api.models import Price, PriceBudgetUser
        imported = 0
        skipped = 0
        for r in rows:
            # Attempt to map common fields — be forgiving about names
            product = r.get("product") or r.get("name") or r.get("item")
            location = r.get("location") or r.get("market") or "Unknown"
            # price field may be numeric or string
            price_val = r.get("price")
            try:
                price = float(price_val) if price_val is not None else None
            except Exception:
                price = None

            date_str = r.get("date") or r.get("created_at") or r.get("timestamp")
            date = None
            if date_str:
                try:
                    date = dateparser.parse(date_str)
                except Exception:
                    date = None

            if not product or price is None:
                skipped += 1
                continue

            # Avoid exact duplicates by matching product+location+price+date
            q = Price.objects.filter(product__iexact=product, location__iexact=location, price=price)
            if date:
                q = q.filter(date=date)

            if q.exists():
                skipped += 1
                continue

            # Insert with SOURCE_USER if a user is present, else demo
            source = r.get("source") or ("user" if r.get("submitted_by") else "demo")

            # Use a null submitted_by; linking by email would require looking up the user table
            Price.objects.create(
                product=product,
                price=price,
                location=location,
                source=source,
                date=date,
            )
            imported += 1

        self.stdout.write(self.style.SUCCESS(f"Imported: {imported}, Skipped: {skipped}"))
