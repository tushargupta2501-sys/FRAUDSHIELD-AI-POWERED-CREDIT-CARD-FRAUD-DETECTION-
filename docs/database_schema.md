# SentinelAI Database Schema Specification

SentinelAI utilizes PostgreSQL 16 for relational integrity, time-indexed transaction storage, and audit logs.

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ CARDS : owns
    CARDS ||--o{ TRANSACTIONS : executes
    TRANSACTIONS ||--o| RISK_ASSESSMENTS : receives
    RISK_ASSESSMENTS ||--o{ FRAUD_ALERTS : generates
    USERS ||--o| BEHAVIORAL_PROFILES : maintains
    RULES ||--o{ RULE_VIOLATION_LOGS : triggers

    USERS {
        uuid id PK
        varchar full_name
        varchar email
        varchar phone_number
        varchar risk_segment
        timestamp created_at
    }

    CARDS {
        uuid id PK
        uuid user_id FK
        varchar masked_pan
        varchar card_network
        varchar expiration_date
        varchar card_status
        numeric credit_limit
        timestamp issued_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid card_id FK
        uuid user_id FK
        numeric amount
        varchar currency
        varchar merchant_name
        varchar mcc
        varchar country
        numeric latitude
        numeric longitude
        varchar ip_address
        varchar device_id
        timestamp timestamp
        varchar status
    }

    RISK_ASSESSMENTS {
        uuid id PK
        uuid transaction_id FK
        numeric risk_score
        varchar risk_tier
        varchar decision
        numeric ml_probability
        jsonb shap_explanations
        jsonb triggered_rules
        numeric behavioral_score
        numeric latency_ms
        timestamp evaluated_at
    }

    BEHAVIORAL_PROFILES {
        uuid user_id PK, FK
        numeric avg_amount_30d
        numeric std_amount_30d
        numeric max_amount_30d
        int total_txns_30d
        jsonb common_mccs
        jsonb common_countries
        timestamp last_updated
    }

    RULES {
        uuid id PK
        varchar rule_code UK
        varchar name
        text description
        varchar condition_type
        jsonb parameters
        numeric weight
        boolean is_active
        timestamp created_at
    }

    FRAUD_ALERTS {
        uuid id PK
        uuid transaction_id FK
        varchar severity
        varchar status
        varchar assigned_analyst
        text notes
        timestamp created_at
        timestamp resolved_at
    }
```

---

## 2. Table Schemas & Indexes

### 2.1 `transactions` Table
- `id` (UUID, Primary Key)
- `card_id` (UUID, Indexed)
- `user_id` (UUID, Indexed)
- `amount` (NUMERIC(12, 2), NOT NULL)
- `currency` (VARCHAR(3), Default 'USD')
- `merchant_name` (VARCHAR(150), NOT NULL)
- `mcc` (VARCHAR(4), NOT NULL)
- `country` (VARCHAR(2), NOT NULL)
- `latitude` (NUMERIC(9, 6))
- `longitude` (NUMERIC(9, 6))
- `ip_address` (VARCHAR(45))
- `device_id` (VARCHAR(100))
- `timestamp` (TIMESTAMP WITH TIME ZONE, NOT NULL, Indexed DESC)
- `status` (VARCHAR(20), e.g., 'APPROVED', 'DECLINED', 'CHALLENGED')

### 2.2 `risk_assessments` Table
- `id` (UUID, Primary Key)
- `transaction_id` (UUID, Unique, Foreign Key -> `transactions.id`)
- `risk_score` (NUMERIC(5, 2), NOT NULL) — 0.00 to 100.00
- `risk_tier` (VARCHAR(20)) — LOW, MEDIUM, HIGH, CRITICAL
- `decision` (VARCHAR(20)) — ALLOW, CHALLENGE, BLOCK
- `ml_probability` (NUMERIC(6, 5)) — 0.00000 to 1.00000
- `shap_explanations` (JSONB) — Feature contributions array
- `triggered_rules` (JSONB) — Array of violated rule IDs & descriptions
- `behavioral_score` (NUMERIC(6, 3)) — Anomaly Z-Score
- `latency_ms` (NUMERIC(7, 2)) — Pipeline execution time in ms
- `evaluated_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)

### 2.3 `behavioral_profiles` Table
- `user_id` (UUID, Primary Key, Foreign Key -> `users.id`)
- `avg_amount_30d` (NUMERIC(12, 2), Default 0.00)
- `std_amount_30d` (NUMERIC(12, 2), Default 0.00)
- `max_amount_30d` (NUMERIC(12, 2), Default 0.00)
- `total_txns_30d` (INT, Default 0)
- `common_mccs` (JSONB) — Array of top MCCs
- `common_countries` (JSONB) — Array of ISO country codes
- `last_updated` (TIMESTAMP WITH TIME ZONE)
