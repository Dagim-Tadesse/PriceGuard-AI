# Database

This folder contains the database schema and demo seed assets for PriceGuard-AI.

## What it does

The database layer is the persistent source of truth for users, prices, and points tracking.

It is responsible for:

- Defining the Supabase/Postgres tables.
- Keeping demo data deterministic and easy to reseed.
- Supporting time-series queries for the backend and AI layer.
- Applying row-level security rules for browser-safe demo access.

## Main files

- `schema.sql` - schema definition, indexes, and RLS policies.
- `data.sql` - seed script for demo users and product histories.
- `seed.json` - sample structured data for experiments or import tools.

## Core tables

The current schema centers on the `pricebudget_*` namespace:

- `pricebudget_users` - buyer, seller, and admin profiles.
- `pricebudget_prices` - product price history rows.
- `pricebudget_points_ledger` - audit trail for point changes.

## How it communicates

The database is not accessed directly by the browser in production code. Instead:

- Django reads and writes through ORM models.
- The frontend can read certain Supabase-backed rows directly when RLS allows it.
- The AI layer uses the price history to calculate trend and recommendation output.

## Developer notes

- Keep column names stable; the backend serializers and model code depend on them.
- If you change RLS policies, re-test the frontend dashboard and signup flow.
- If the dashboard is empty, confirm the seed ran and the policies permit the intended read path.
- For demo data resets, prefer repeatable seed scripts over manual edits.

## Working with the schema

Typical workflow:

1. Update `schema.sql` when the table shape or policies change.
2. Update backend models and serializers to match.
3. Refresh `data.sql` so demo data still tells a clear story.
4. Re-run the schema and seed in Supabase or your local database.

## Notes for the team

- This folder is the place to reason about schema shape, demo data, and safe resets.
- Keep documentation and seed data aligned so the demo always shows meaningful price trends.