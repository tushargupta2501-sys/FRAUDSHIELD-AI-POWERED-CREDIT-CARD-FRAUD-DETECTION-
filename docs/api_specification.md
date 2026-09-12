# SentinelAI API Specification

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication & Security Headers

Every transaction ingestion request can include HMAC validation headers:
- `X-API-Key`: Public merchant/POS key identifier.
- `X-Signature`: Hex-encoded SHA-256 HMAC of the request body using the shared client secret.
- `X-Timestamp`: Epoch timestamp in seconds to prevent replay attacks.

---

## 2. Endpoints

### 2.1 Real-Time Ingestion & Evaluation
**`POST /transactions/evaluate`**
Evaluates a transaction in real-time through ML, Rules, and Behavioral engines.

#### Request Body
```json
{
  "card_id": "card_98234",
  "user_id": "usr_4402",
  "amount": 1450.00,
  "currency": "USD",
  "merchant_category_code": "5732",
  "merchant_name": "ElectroMart NY",
  "country": "US",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "device_id": "dev_mac_3811",
  "ip_address": "198.51.100.42"
}
```

#### Response Body (HTTP 200)
```json
{
  "transaction_id": "9f7b6b1a-289b-4b13-a5c2-f19b1689df9a",
  "timestamp": "2026-09-12T16:04:18.120Z",
  "decision": "BLOCK",
  "risk_score": 88.5,
  "risk_tier": "CRITICAL",
  "ml_score": 0.842,
  "rule_violations": [
    {
      "rule_id": "RULE_VELOCITY_5M",
      "rule_name": "Velocity Exceeded",
      "severity": "HIGH",
      "description": "More than 3 transactions in under 5 minutes"
    },
    {
      "rule_id": "RULE_HIGH_VALUE_ELECTRONICS",
      "rule_name": "High Value Electronics",
      "severity": "MEDIUM",
      "description": "Transaction > $1000 at MCC 5732 (Consumer Electronics)"
    }
  ],
  "behavioral_anomaly_score": 3.82,
  "shap_factors": [
    {
      "feature": "amount",
      "value": 1450.0,
      "contribution": 1.42,
      "impact": "INCREASES_RISK",
      "explanation": "Amount $1450 is 4.2x above 30-day baseline ($120.50)"
    },
    {
      "feature": "tx_velocity_1h",
      "value": 5,
      "contribution": 0.95,
      "impact": "INCREASES_RISK",
      "explanation": "High transaction burst frequency in 1-hour window"
    }
  ],
  "processing_time_ms": 14.8
}
```

---

### 2.2 Transaction Query & History
- **`GET /transactions`**: Retrieve paginated transactions with filter parameters (`decision`, `risk_tier`, `min_score`, `start_date`, `end_date`, `page`, `limit`).
- **`GET /transactions/{id}`**: Detailed breakdown of a single transaction including full SHAP explanations.

---

### 2.3 Rule Configuration Management
- **`GET /rules`**: List all active and inactive deterministic rules with their parameters.
- **`POST /rules`**: Create a new rule.
- **`PUT /rules/{id}`**: Update rule threshold, weight, or enabled status.
- **`DELETE /rules/{id}`**: Remove a rule.

---

### 2.4 Analytics & Explainability
- **`GET /analytics/summary`**: Overall platform metrics (Total Transactions, Fraud Rate %, Total Prevented Loss $, Average Latency ms, Decision Distribution).
- **`GET /analytics/timeseries`**: Fraud vs. Legitimate volume time-series for charting.
- **`GET /analytics/shap-global`**: Global feature importance ranked across the trained XGBoost model.

---

### 2.5 Real-Time WebSocket Channel
**`WS /ws/transactions`**
Streams all evaluated transactions in real-time to dashboard clients.

#### WebSocket Message Payload
```json
{
  "type": "NEW_TRANSACTION",
  "data": {
    "transaction_id": "9f7b6b1a-...",
    "user_id": "usr_4402",
    "amount": 1450.00,
    "merchant_name": "ElectroMart NY",
    "decision": "BLOCK",
    "risk_score": 88.5,
    "risk_tier": "CRITICAL",
    "timestamp": "2026-09-12T16:04:18.120Z"
  }
}
```
