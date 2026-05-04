-- PriceGuard AI Supabase schema
-- All project tables use the `pricebudget_` prefix to avoid collisions with other apps.

CREATE TABLE IF NOT EXISTS pricebudget_users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    role VARCHAR(12) NOT NULL DEFAULT 'buyer' CHECK (
        role IN ('buyer', 'seller', 'admin')
    ),
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pricebudget_users_email_idx ON pricebudget_users (email);

CREATE INDEX IF NOT EXISTS pricebudget_users_role_idx ON pricebudget_users (role);

CREATE TABLE IF NOT EXISTS pricebudget_prices (
    id BIGSERIAL PRIMARY KEY,
    product VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    location VARCHAR(100) NOT NULL,
    source VARCHAR(10) NOT NULL DEFAULT 'demo' CHECK (source IN ('user', 'demo')),
    submitted_by_id BIGINT NULL REFERENCES pricebudget_users (id) ON DELETE SET NULL,
    confirmations INTEGER NOT NULL DEFAULT 1 CHECK (confirmations >= 1),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pricebudget_prices_product_date_idx ON pricebudget_prices (product, date DESC);

CREATE INDEX IF NOT EXISTS pricebudget_prices_location_idx ON pricebudget_prices (location);

CREATE INDEX IF NOT EXISTS pricebudget_prices_submitted_by_idx ON pricebudget_prices (submitted_by_id);

ALTER TABLE pricebudget_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pricebudget_prices_select_anon ON pricebudget_prices;

CREATE POLICY pricebudget_prices_select_anon ON pricebudget_prices FOR
SELECT TO anon USING (true);

DROP POLICY IF EXISTS pricebudget_prices_insert_anon ON pricebudget_prices;

CREATE POLICY pricebudget_prices_insert_anon ON pricebudget_prices FOR
INSERT
    TO anon
WITH
    CHECK (true);

ALTER TABLE pricebudget_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pricebudget_users_select_anon ON pricebudget_users;

CREATE POLICY pricebudget_users_select_anon ON pricebudget_users FOR
SELECT TO anon USING (true);

DROP POLICY IF EXISTS pricebudget_users_insert_anon ON pricebudget_users;

CREATE POLICY pricebudget_users_insert_anon ON pricebudget_users FOR
INSERT
    TO anon
WITH
    CHECK (true);

DROP POLICY IF EXISTS pricebudget_prices_update_anon ON pricebudget_prices;

CREATE POLICY pricebudget_prices_update_anon ON pricebudget_prices FOR
UPDATE TO anon USING (true)
WITH
    CHECK (true);

CREATE TABLE IF NOT EXISTS pricebudget_points_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES pricebudget_users (id) ON DELETE CASCADE,
    points_delta INTEGER NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pricebudget_points_ledger_user_idx ON pricebudget_points_ledger (user_id, created_at DESC);