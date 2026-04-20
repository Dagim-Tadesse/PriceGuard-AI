# PriceGuard AI — Backend (Django)

## Overview

PriceGuard AI is a backend service built with Django and Django REST Framework that collects product price data, analyzes historical trends, and integrates an AI prediction engine to provide actionable insights.

The system enables users to:

* Track price changes over time
* Analyze trends (increasing, decreasing, stable)
* Receive AI-driven recommendations (buy now or wait)

---

## Architecture

The backend follows a clean, modular architecture:

```
backend/
│
├── priceguard/        # Django project config
├── api/               # Core application
│   ├── models.py      # Database schema
│   ├── views.py       # API endpoints
│   ├── serializers.py # Data formatting
│   ├── services.py    # Business logic (AI + DB)
│
├── ai/                # AI module
│   ├── predictor.py   # Prediction engine
│   ├── utils.py       # Helper functions
```

---

## Tech Stack

* Python 3.x
* Django
* Django REST Framework
* SQLite (default, easily replaceable)
* Custom AI logic (no external ML dependency)

---

## Database Model

### Price

| Field    | Type       | Description                |
| -------- | ---------- | -------------------------- |
| product  | CharField  | Product name               |
| price    | FloatField | Price value                |
| location | CharField  | Market/store location      |
| date     | DateTime   | Timestamp (auto-generated) |

---

## API Endpoints

### 1. Get All Products with AI Insights

```
GET /api/prices/
```

Response:

```json
[
  {
    "product": "Cooking Oil (5L)",
    "price": 1050,
    "location": "Bole Supermarket",
    "trend": "increasing",
    "action": "buy_now"
  }
]
```

---

### 2. Add New Price Entry

```
POST /api/prices/add/
```

Body:

```json
{
  "product": "Milk",
  "price": 70,
  "location": "Addis Market"
}
```

---

### 3. Get Product Price History

```
GET /api/prices/<product>/
```

---

### 4. Get AI Prediction

```
GET /api/prediction/<product>/
```

Response:

```json
{
  "trend": "increasing",
  "predicted_price": 1100,
  "action": "buy_now",
  "confidence": 0.85,
  "reason": "Price increased over the last 3 days"
}
```

---

## AI Integration

The backend integrates a custom AI module:

* **Trend Detection**
* **Next Price Prediction**
* **Confidence Scoring**
* **Decision Engine (buy_now / wait)**

### Flow:

```
View → Service Layer → AI Predictor → Response
```

All AI logic is isolated in `/ai/predictor.py`, keeping the backend clean and maintainable.

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repo-url>
cd PriceGuard-AI/backend/priceguard
```

---

### 2. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
```

---

### 3. Install Dependencies

```bash
pip install django djangorestframework
```

---

### 4. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 5. Load Seed Data (Optional)

```bash
python load_seed.py
```

---

### 6. Run Server

```bash
python manage.py runserver
```

---

## Testing

Use:

* Browser
* Postman
* Curl

Example:

```
http://127.0.0.1:8000/api/prices/
```

---

## Design Principles

* Keep views lightweight
* Move logic to services layer
* Maintain consistent API response format
* Decouple AI logic from Django core

---

## Success Criteria

* APIs respond correctly
* AI predictions are dynamic
* Frontend integrates without issues
* System handles real-world price fluctuations

---

## Final Thought

This backend is not just an API.

It is a **decision engine** — transforming raw price data into actionable intelligence.
