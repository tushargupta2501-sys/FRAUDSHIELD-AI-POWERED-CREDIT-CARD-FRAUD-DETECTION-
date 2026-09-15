# SentinelAI: End-to-End (E2E) Testing Scenarios

This document details complete end-to-end integration and operational scenarios for testing SentinelAI across payment processing, rule evaluation, ML scoring, SHAP explainability, and analyst investigation workflows.

---

## Scenario 1: Legitimate Low-Risk E-Commerce Purchase

### Objective
Verify that a typical daylight online retail purchase by a customer with normal behavioral history is automatically approved (**ALLOW**) with zero penalty flags.

### Test Workflow Steps

1. **Transaction Submission**:
   - Customer ID: `cust_49012`
   - Amount: `$45.50`
   - Merchant Code: `5311` (Department Stores)
   - Timestamp: `14:30:00 UTC` (Daylight Peak Hours)
   - Velocity: 1 transaction in past 24 hours.

2. **Backend Processing**:
   - `POST /api/v1/transactions/check` triggered.
   - Rule Engine check: Zero rules violated (`HIGH_AMOUNT_OFF_PEAK` = False, `RAPID_VELOCITY` = False).
   - XGBoost ML Model evaluation: $P(\text{fraud}) = 0.0012$.
   - Combined Risk Score calculation:
     $$\text{Score} = (0.50 \times 0.12) + (0.35 \times 0) + (0.15 \times 0) = 0.06$$

3. **Expected Outcome**:
   - Risk Score: **0.06 / 100**
   - Recommendation: **ALLOW**
   - HTTP Status: `200 OK`
   - Frontend UI: Green badge displayed on **Simulator Result Screen**.

---

## Scenario 2: Off-Peak Velocity Surge & High Amount Attack

### Objective
Verify that an automated carding bot submitting high-value transactions during off-peak night hours is immediately flagged and blocked (**BLOCK**).

### Test Workflow Steps

1. **Transaction Submission**:
   - Customer ID: `cust_11029`
   - Amount: `$3,850.00`
   - Merchant Code: `7995` (Online Gambling)
   - Timestamp: `02:15:00 UTC` (Off-Peak Hours)
   - Velocity: 4 transactions within 30 seconds.

2. **Backend Processing**:
   - `POST /api/v1/transactions/check` triggered.
   - Rule Engine check:
     - `HIGH_AMOUNT_OFF_PEAK` violated (+35 pts).
     - `RAPID_VELOCITY` violated (+40 pts).
     - `HIGH_RISK_MCC` violated (+25 pts).
     - Total Rule Penalty Score = $35 + 40 + 25 = 100$ pts.
   - XGBoost ML Model evaluation: $P(\text{fraud}) = 0.945$ ($S_{\text{ML}} = 94.5$).
   - Combined Risk Score calculation:
     $$\text{Score} = (0.50 \times 94.5) + (0.35 \times 100) + (0.15 \times 0) = 47.25 + 35.0 = 82.25$$

3. **SHAP Explanation Generation**:
   - `GET /api/v1/explainability/tx_99812` returns:
     - `V14`: SHAP attribution $+0.381$ (*"V14 contributed significantly to increasing fraud risk"*).
     - `V10`: SHAP attribution $+0.294$ (*"V10 contributed significantly to increasing fraud risk"*).
     - `Amount`: SHAP attribution $+0.112$.

4. **Expected Outcome**:
   - Risk Score: **82.25 / 100**
   - Recommendation: **BLOCK**
   - Fraud Alert generated in database and pushed to **Fraud Alerts List**.
   - Frontend UI: Red BLOCK alert badge displayed with top SHAP feature attributions.

---

## Scenario 3: Medium-Risk Anomaly Flagged for Manual Review

### Objective
Verify that an unusual transaction with partial risk indicators is categorized under **REVIEW** (Risk Score between 30 and 69) and successfully dispatched to the Analyst Investigation Dashboard.

### Test Workflow Steps

1. **Transaction Submission**:
   - Customer ID: `cust_78190`
   - Amount: `$1,200.00` (Customer average = `$120.00`)
   - Merchant Code: `5944` (Jewelry Store)
   - Timestamp: `11:00:00 UTC` (Daylight)
   - Velocity: 1 transaction.

2. **Backend Processing**:
   - Rule Engine check:
     - `AMOUNT_DEV_HIGH` violated ($Z\text{-score} = 4.2$, penalty = +30 pts).
     - `HIGH_RISK_MCC` violated (+25 pts).
     - Total Rule Penalty Score = $55$ pts.
   - XGBoost ML Model evaluation: $P(\text{fraud}) = 0.280$ ($S_{\text{ML}} = 28.0$).
   - Combined Risk Score calculation:
     $$\text{Score} = (0.50 \times 28.0) + (0.35 \times 55.0) + (0.15 \times 0) = 14.0 + 19.25 = 33.25$$

3. **Expected Outcome**:
   - Risk Score: **33.25 / 100**
   - Recommendation: **REVIEW**
   - Open case auto-created in `/api/v1/fraud-cases`.
   - Frontend UI: Amber REVIEW badge displayed in **Investigation Dashboard**.

---

## Scenario 4: Analyst Case Investigation & Resolution Workflow

### Objective
Verify that a fraud analyst can open a pending case, review all 5 investigation panels, and confirm or dismiss the fraud alert.

### Test Workflow Steps

1. **Dashboard Access**:
   - Analyst logs into frontend workbench (`admin@sentinel.ai`).
   - Navigates to **Investigation Dashboard**.
   - Clicks on open case `CASE-3325`.

2. **Deep-Dive Investigation**:
   - **View 1: Transaction Details**: Review raw amount, timestamp, merchant code, card token.
   - **View 2: Rule Violations**: Inspect triggered rules (`AMOUNT_DEV_HIGH`, `HIGH_RISK_MCC`).
   - **View 3: Behavioral Analysis**: Inspect customer historical mean ($120.00 vs $1,200.00).
   - **View 4: Historical Intelligence**: Check card token against blacklist ledger.
   - **View 5: SHAP Explanations**: Inspect feature attributions (V14, V10, Amount).

3. **Case Resolution**:
   - Analyst marks case status as **CONFIRMED_FRAUD**.
   - System adds card token `card_tok_78190` to the **Historical Intelligence Blacklist**.
   - Subsequent transactions with this card token will trigger `HISTORICAL_BLACK_MATCH` (+50 pts).

4. **Expected Outcome**:
   - Case status updated to `CONFIRMED_FRAUD`.
   - Entity blacklisted successfully.
   - API returns `200 OK` on case update.
