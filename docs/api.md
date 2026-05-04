# API Contract (current implementation)

Base path: `/api`

Note: Responses are plain JSON (no `{ ok, data }` envelope).

## Endpoints

### 1) Add price

`POST /api/prices/add/`

Request:

```json
{
  "product": "Cooking Oil (5L)",
  "price": 1050,
  "location": "Bole Supermarket"
}
```

Response (saved record):

```json
{
  "id": 123,
  "product": "Cooking Oil (5L)",
  "price": 1050.0,
  "location": "Bole Supermarket",
  "date": "2024-04-05T00:00:00Z"
}
```

### 2) List latest prices (with AI trend/action)

`GET /api/prices/`

Response:

```json
[
  {
    "product": "Cooking Oil (5L)",
    "price": 1050.0,
    "location": "Bole Supermarket",
    "trend": "increasing",
    "action": "buy_now"
  }
]
```

### 3) Product price history

`GET /api/prices/<product>/`

Response:

```json
[
  {
    "id": 1,
    "product": "Cooking Oil (5L)",
    "price": 950.0,
    "location": "Bole Supermarket",
    "date": "2024-04-01T00:00:00Z"
  }
]
```

### 4) Product prediction

`GET /api/prediction/<product>/`

Response:

```json
{
  "trend": "increasing",
  "predicted_price": 1100.0,
  "action": "buy_now",
  "confidence": 0.85,
  "reason": "Price increased over the last 3 days",
  "current_price": 1050.0
}
```

### 5) List users

`GET /api/users/`

Response:

```json
[
  {
    "id": 1,
    "name": "Demo Buyer",
    "email": "buyer@priceguard.local",
    "role": "buyer",
    "points": 25,
    "is_active": true,
    "created_at": "2026-05-03T00:00:00Z",
    "updated_at": "2026-05-03T00:00:00Z"
  }
]
```

### 6) Create user

`POST /api/users/`

Request:

```json
{
  "name": "Ada Seller",
  "email": "ada@example.com",
  "role": "seller",
  "points": 12
}
```

### 7) Award points to a user

`POST /api/users/<user_id>/award-points/`

Request:

```json
{
  "points": 5
}
```
