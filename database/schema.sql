-- Main Database Structure for PriceGuard AI
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    product VARCHAR(100) NOT NULL,
    price FLOAT NOT NULL,
    location VARCHAR(100) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);