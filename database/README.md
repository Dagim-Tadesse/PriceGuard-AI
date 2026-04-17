# PriceGuard AI - Database Architecture & Seed Data

## 📌 Overview
This folder contains the single source of truth for the PriceGuard AI system data. 

## 🏗️ 1. Schema Structure (`schema.sql`)
We are using a flat table structure to make time-series AI predictions and backend querying as fast and simple as possible.
- **Table Name:** `prices`
- **Fields:** `id` (PK), `product` (str), `price` (float), `location` (str), `date` (timestamp)

*Note for Backend (Django): Please ensure your models.py uses these exact field names so the data syncs perfectly.*

## 🧪 2. Demo Data (`seed.json`)
The `seed.json` file contains realistic, time-ordered market data specifically engineered for our AI model to detect trends.

**Key Data Stories included for Demo:**
1. 📈 **Cooking Oil (5L):** Shows a clear **Increasing Trend** (Inflation). Includes price variations between Bole and Merkato.
2. 📉 **Tomatoes (1kg):** Shows a clear **Decreasing Trend** (Seasonal drop).
3. ➖ **Bread (Loaf):** Shows a **Stable Trend** (Price control).

**Formatting Rules Applied:**
- Ordered by Date ASC (Oldest to Newest).
- No missing values.
- Clean, consistent product naming conventions.

## 🛠️ Usage
AI/ML Member: You can parse the JSON directly to test your forecasting models right now.
Backend Member: You can use this JSON to populate the Django database.