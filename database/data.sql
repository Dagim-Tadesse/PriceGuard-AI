-- Sample data for a fresh Supabase load.
-- This file is safe to re-run because each INSERT checks for existing rows first.

BEGIN;

WITH
    user_seed (
        name,
        email,
        role,
        points,
        is_active,
        created_at,
        updated_at
    ) AS (
        VALUES (
                'Amina Bekele',
                'amina@example.com',
                'buyer',
                42,
                TRUE,
                TIMESTAMPTZ '2026-05-01 08:00:00+00',
                TIMESTAMPTZ '2026-05-03 08:00:00+00'
            ),
            (
                'Tadesse Mekonnen',
                'tadesse@example.com',
                'seller',
                28,
                TRUE,
                TIMESTAMPTZ '2026-05-01 09:00:00+00',
                TIMESTAMPTZ '2026-05-03 09:00:00+00'
            ),
            (
                'Selam Gebru',
                'selam@example.com',
                'admin',
                64,
                TRUE,
                TIMESTAMPTZ '2026-05-01 10:00:00+00',
                TIMESTAMPTZ '2026-05-03 10:00:00+00'
            )
    ),
    upserted_users AS (
        INSERT INTO
            pricebudget_users (
                name,
                email,
                role,
                points,
                is_active,
                created_at,
                updated_at
            )
        SELECT
            name,
            email,
            role,
            points,
            is_active,
            created_at,
            updated_at
        FROM user_seed ON CONFLICT (email) DO
        UPDATE
        SET
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            points = EXCLUDED.points,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at RETURNING id,
            email
    )
INSERT INTO
    pricebudget_points_ledger (
        user_id,
        points_delta,
        event_type,
        note,
        created_at
    )
SELECT u.id, s.points_delta, s.event_type, s.note, s.created_at
FROM (
        VALUES (
                'amina@example.com', 25, 'manual_award', 'Initial onboarding bonus', TIMESTAMPTZ '2026-05-01 08:30:00+00'
            ), (
                'tadesse@example.com', 20, 'manual_award', 'Seller verification bonus', TIMESTAMPTZ '2026-05-01 09:30:00+00'
            ), (
                'selam@example.com', 50, 'manual_award', 'Admin setup bonus', TIMESTAMPTZ '2026-05-01 10:30:00+00'
            )
    ) AS s (
        user_email, points_delta, event_type, note, created_at
    )
    JOIN upserted_users u ON u.email = s.user_email
WHERE
    NOT EXISTS (
        SELECT 1
        FROM pricebudget_points_ledger l
        WHERE
            l.user_id = u.id
            AND l.event_type = s.event_type
            AND l.created_at = s.created_at
    );

WITH
product_data(product_id, product, base_price) AS (
    VALUES
        (1, 'Teff Flour 25kg', 4200.00),
        (2, 'Cooking Oil 5L', 950.00),
        (3, 'Berbere 1kg', 480.00),
        (4, 'Sugar 50kg', 5800.00),
        (5, 'Coffee Beans 1kg', 720.00),
        (6, 'Wheat Flour 25kg', 3100.00),
        (7, 'Onions 100kg', 6400.00),
        (8, 'Smartphone X12', 38500.00),
        (9, 'Rice 25kg', 3600.00),
        (10, 'Soap Carton', 980.00)
),
day_data(day_index, day_label) AS (
    VALUES
        (0, TIMESTAMPTZ '2026-05-01 08:00:00+00'),
        (1, TIMESTAMPTZ '2026-05-02 08:00:00+00'),
        (2, TIMESTAMPTZ '2026-05-03 08:00:00+00'),
        (3, TIMESTAMPTZ '2026-05-04 08:00:00+00'),
        (4, TIMESTAMPTZ '2026-05-05 08:00:00+00'),
        (5, TIMESTAMPTZ '2026-05-06 08:00:00+00'),
        (6, TIMESTAMPTZ '2026-05-07 08:00:00+00'),
        (7, TIMESTAMPTZ '2026-05-08 08:00:00+00'),
        (8, TIMESTAMPTZ '2026-05-09 08:00:00+00'),
        (9, TIMESTAMPTZ '2026-05-10 08:00:00+00')
),
location_data(location_id, location, location_factor) AS (
    VALUES
        (1, 'Bole', 1.00),
        (2, 'Megenagna', 1.02),
        (3, 'Merkato', 0.98),
        (4, 'Kazanchis', 1.03),
        (5, 'Piassa', 1.01),
        (6, 'Adama', 0.97),
        (7, 'Hawassa', 1.04),
        (8, 'Bahir Dar', 1.05),
        (9, 'Mekelle', 0.99),
        (10, 'Gondar', 1.00)
),
generated_prices AS (
    SELECT
        row_number() OVER (ORDER BY p.product_id, d.day_index) AS rn,
        p.product,
        p.base_price,
        d.day_index,
        d.day_label,
        l.location,
        l.location_factor
    FROM product_data p
    CROSS JOIN day_data d
    JOIN location_data l
      ON l.location_id = ((p.product_id + d.day_index - 1) % 10) + 1
),
final_prices AS (
    SELECT
        rn,
        product,
        round((base_price * location_factor) + ((day_index - 4) * 18) + ((rn - 1) % 4) * 6, 2) AS price,
        location,
        'user'::varchar AS source,
        CASE ((rn - 1) % 3)
            WHEN 0 THEN 'amina@example.com'
            WHEN 1 THEN 'tadesse@example.com'
            ELSE 'selam@example.com'
        END AS submitted_by_email,
        1 + ((rn - 1) % 3) AS confirmations,
        day_label + (((rn - 1) % 8) * INTERVAL '1 hour') AS date
    FROM generated_prices
)
INSERT INTO pricebudget_prices (product, price, location, source, submitted_by_id, confirmations, date)
SELECT fp.product, fp.price, fp.location, fp.source, u.id, fp.confirmations, fp.date
FROM final_prices fp
JOIN pricebudget_users u ON u.email = fp.submitted_by_email
WHERE NOT EXISTS (
    SELECT 1
    FROM pricebudget_prices p
    WHERE p.product = fp.product
      AND p.location = fp.location
      AND p.date = fp.date
);

SELECT setval (
        pg_get_serial_sequence ('pricebudget_users', 'id'), COALESCE(
            (
                SELECT MAX(id)
                FROM pricebudget_users
            ), 1
        ), true
    );

SELECT setval (
        pg_get_serial_sequence (
            'pricebudget_points_ledger', 'id'
        ), COALESCE(
            (
                SELECT MAX(id)
                FROM pricebudget_points_ledger
            ), 1
        ), true
    );

SELECT setval (
        pg_get_serial_sequence ('pricebudget_prices', 'id'), COALESCE(
            (
                SELECT MAX(id)
                FROM pricebudget_prices
            ), 1
        ), true
    );

COMMIT;