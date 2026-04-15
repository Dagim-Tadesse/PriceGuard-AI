\# API Contract (v1)

Base path: \`/api\`

\## Response envelope (success)

\```json
{\
 "ok": true,\
 "data": {\/_ endpoint-specific _\/}\
}
\```

\## Response envelope (error)

\```json
{\
 "ok": false,\
 "error": {\
 "code": "VALIDATION_ERROR",\
 "message": "Human readable message",\
 "details": {\/_ optional _/\}\
 }\
}
\```

\## Endpoints

\### 1) Add price

\`POST /api/prices/\`

Request:

\```json
{\
 "product_name": "Coca Cola 50cl",\
 "location": "Accra",\
 "price": 12.50\
}
\```

Response:

\```json
{\
 "ok": true,\
 "data": {\
 "product": {"id": 1, "name": "Coca Cola 50cl", "location": "Accra"},\
 "price_entry": {"id": 10, "price": 12.5, "recorded_at": "2026-04-15T12:00:00Z"}\
 }\
}
\```

\### 2) List products (with latest price + decision)

\`GET /api/products/\`

Response:

\```json
{\
 "ok": true,\
 "data": {\
 "items": [\
 {\
 "id": 1,\
 "name": "Coca Cola 50cl",\
 "location": "Accra",\
 "latest_price": 12.5,\
 "latest_recorded_at": "2026-04-15T12:00:00Z",\
 "trend": "increasing",\
 "action": "wait"\
 }\
 ]\
 }\
}
\```

\### 3) Product price history

\`GET /api/products/{product_id}/history/\`

Response:

\```json
{\
 "ok": true,\
 "data": {\
 "product": {"id": 1, "name": "Coca Cola 50cl", "location": "Accra"},\
 "history": [\
 {"id": 8, "price": 11.0, "recorded_at": "2026-04-13T12:00:00Z"},\
 {"id": 9, "price": 11.5, "recorded_at": "2026-04-14T12:00:00Z"},\
 {"id": 10, "price": 12.5, "recorded_at": "2026-04-15T12:00:00Z"}\
 ]\
 }\
}
\```

\### 4) Product prediction

\`GET /api/products/{product_id}/prediction/\`

Response:

\```json
{\
 "ok": true,\
 "data": {\
 "product": {"id": 1, "name": "Coca Cola 50cl", "location": "Accra"},\
 "trend": "increasing",\
 "predicted_price": 13.0,\
 "action": "wait",\
 "confidence": 0.62,\
 "reason": "Last 3 prices increased."\
 }\
}
\```
