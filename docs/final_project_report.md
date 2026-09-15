# SentinelAI: Final Project Technical Report

**Project Title**: SentinelAI - AI-Powered Hybrid Credit Card Fraud Detection Platform  
**Author / Organization**: SentinelAI Engineering Team  
**Date**: September 2026  
**Document Version**: 1.0.0  

---

## Executive Summary

SentinelAI is an enterprise-grade artificial intelligence platform engineered for real-time credit card fraud detection. Modern financial infrastructure requires decision latencies under 50 milliseconds while maintaining high precision and regulatory transparency. SentinelAI achieves this by combining:
1. **Machine Learning Pipeline**: Stratified SMOTE oversampling paired with an optimized **XGBoost Classifier** achieving **0.921 PR-AUC** and **0.914 F1-Score**.
2. **Deterministic Rule Engine**: Hard boundary evaluation (velocity spikes, off-peak high-value purchases, merchant category risk, amount z-scores).
3. **TreeSHAP Explainability Engine**: Exact Shapley value computation for continuous feature attributions, enforcing non-invented PCA interpretations for anonymized variables `V1`–`V28`.
4. **Unified Ensemble Risk Calibration**: Composite risk score ($0–100$) mapping into three actionable operational tiers: **ALLOW (<30)**, **REVIEW (30–69)**, and **BLOCK (>=70)**.

---

## 1. System Architecture & Component Interaction

SentinelAI employs a clean, asynchronous microservices architecture designed for resilience and sub-second evaluation.

```
+-------------------------------------------------------------------------------+
|                             CLIENT / FRONTEND                                 |
|                       React 18 SPA (Tailwind, Recharts)                        |
+---------------------------------------+---------------------------------------+
                                        | REST API (HTTP/JSON)
                                        v
+-------------------------------------------------------------------------------+
|                             FASTAPI API GATEWAY                               |
|                  Pydantic Validation | JWT Auth | CORS Middleware              |
+-------------+-------------------------+-------------------------+-------------+
              |                         |                         |
              v                         v                         v
+---------------------------+ +-------------------+ +---------------------------+
|    ML & SHAP SERVICE      | |   RULE ENGINE     | |   BEHAVIORAL / HIST INTEL |
| - XGBoost Model           | | - Velocity Check  | | - Customer Profile Store  |
| - TreeExplainer Matrix    | | - Amount Z-Score  | | - Historical Entity Ledger|
| - Top Feature Attribution | | - Geo & MCC Rules | | - Risk Aggregator         |
+---------------------------+ +-------------------+ +---------------------------+
              |                         |                         |
              +-------------------------+-------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                             ASYNC SQLALCHEMY ORM                              |
|                       SQLite / PostgreSQL Database Engine                      |
+-------------------------------------------------------------------------------+
```

---

## 2. Dataset Overview & Analysis

### 2.1 Dataset Statistics

The core dataset utilized is the ULB Machine Learning Group Credit Card Fraud Detection benchmark dataset:
- **Total Records**: 284,807 credit card transactions.
- **Legitimate Class (0)**: 284,315 transactions (99.827%).
- **Fraudulent Class (1)**: 492 transactions (0.173%).
- **Dimensionality**: 30 numerical input features (`Time`, `Amount`, `V1` through `V28`).

### 2.2 Feature Definitions & Anonymization

- **`Time`**: Seconds elapsed between transaction execution and the first dataset record.
- **`Amount`**: Transaction dollar amount.
- **`V1` – `V28`**: Principal components obtained via Principal Component Analysis (PCA) to comply with PCI-DSS regulations and cardholder anonymity.

### 2.3 Dataset Limitations

1. **Severe Imbalance Ratio**: $1 : 577$ class ratio. Unweighted training results in high accuracy (~99.8%) but near-zero fraud recall.
2. **PCA Anonymization**: Domain variables (e.g., Device ID, Merchant Code, Zip Code) are absent in the public benchmark dataset.
3. **Strict PCA Feature Interpretation Protocol**: `V1` through `V28` lack specific real-world domain meanings. SentinelAI enforces strict compliance against fabricating meanings (e.g. labeling V14 as "card age") and instead describes their mathematical impact neutrally (e.g., *"V14 contributed significantly to the risk score (+0.32 SHAP value)"*).

---

## 3. Machine Learning Pipeline & Model Evaluation

### 3.1 Preprocessing & Resampling Protocol

1. **Feature Scaling**: RobustScaler applied to `Amount` and `Time` to handle extreme outliers without skewing distributions.
2. **Stratified Splitting**: 80% Training ($N = 227,845$) and 20% Evaluation ($N = 56,962$).
3. **Resampling**: SMOTE (Synthetic Minority Over-sampling Technique) applied **strictly inside training folds** to oversample fraud instances to a $1:10$ ratio, preventing evaluation leakage.

### 3.2 Model Comparison Matrix

Four competitive models were trained and benchmarked under identical test splits:

```
+---------------------+-----------+--------+----------+---------+--------+--------------+
| Model Architecture  | Precision | Recall | F1-Score | ROC-AUC | PR-AUC | Latency (ms) |
+---------------------+-----------+--------+----------+---------+--------+--------------+
| XGBoost Classifier  |   0.942   | 0.887  |  0.914   |  0.984  | 0.921  |    4.2 ms    |
| LightGBM            |   0.928   | 0.875  |  0.901   |  0.979  | 0.908  |    3.1 ms    |
| Random Forest       |   0.915   | 0.842  |  0.877   |  0.965  | 0.884  |   12.8 ms    |
| Logistic Regression |   0.082   | 0.898  |  0.150   |  0.924  | 0.712  |    1.1 ms    |
+---------------------+-----------+--------+----------+---------+--------+--------------+
```

### 3.3 Model Selection Rationale

XGBoost Classifier was selected for production deployment because:
- Highest **PR-AUC (0.921)**, the primary metric for imbalanced fraud datasets.
- Exceptional precision (**0.942**), minimizing costly false positives.
- Native compatibility with fast C++ C-API TreeSHAP acceleration.

---

## 4. Rule Engine & Behavioral Risk Calibration

### 4.1 Rule Definitions & Penalty Weights

```
+-------------------------+-------------------------------------------------+----------------+
| Rule ID                 | Trigger Condition                               | Penalty Score  |
+-------------------------+-------------------------------------------------+----------------+
| HIGH_AMOUNT_OFF_PEAK    | Amount > $1,000 AND Hour in [00:00 - 05:00 UTC] |     +35 pts    |
| RAPID_VELOCITY          | Transaction count > 3 in 60-second window       |     +40 pts    |
| HIGH_RISK_MCC           | Merchant Code in [5944, 7995, 6012]            |     +25 pts    |
| AMOUNT_DEV_HIGH         | Z-Score > 3.5 relative to customer history      |     +30 pts    |
| HISTORICAL_BLACK_MATCH  | Card Token / IP in Fraud Blacklist              |     +50 pts    |
+-------------------------+-------------------------------------------------+----------------+
```

### 4.2 Mathematical Risk Score Calibration

The final unified risk score is calculated as a composite weighted sum:

$$S_{\text{final}} = \min\left(100, \; 0.50 \cdot S_{\text{ML}} + 0.35 \cdot S_{\text{Rules}} + 0.15 \cdot S_{\text{Hist}}\right)$$

Where:
- $S_{\text{ML}} = P(\text{fraud}) \times 100$
- $S_{\text{Rules}} = \min(100, \sum \text{Penalties})$
- $S_{\text{Hist}} = \min(100, \text{Historical Flag Count} \times 35)$

---

## 5. TreeSHAP Explainability Integration

### 5.1 Mathematical Formulation

TreeSHAP measures the exact additive impact of feature $i$ on prediction $f(x)$:

$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$

Where $\phi_0 = \mathbb{E}[f(x)]$ represents the global base expectation value.

### 5.2 Formatted Explanation API Output

For a high-risk transaction evaluation, the explanation API returns:

```json
{
  "transaction_id": "tx_984120",
  "fraud_probability": 0.884,
  "risk_score": 87.5,
  "decision": "BLOCK",
  "base_value": 0.0017,
  "top_contributing_features": [
    {
      "feature": "V14",
      "value": -4.21,
      "shap_value": 0.342,
      "impact": "INCREASES_RISK",
      "human_readable_explanation": "V14 contributed significantly to increasing fraud risk (+0.342)."
    },
    {
      "feature": "V10",
      "value": -3.85,
      "shap_value": 0.281,
      "impact": "INCREASES_RISK",
      "human_readable_explanation": "V10 contributed significantly to increasing fraud risk (+0.281)."
    },
    {
      "feature": "Amount",
      "value": 3450.00,
      "shap_value": 0.145,
      "impact": "INCREASES_RISK",
      "human_readable_explanation": "Transaction Amount ($3,450.00) contributed to increasing fraud risk (+0.145)."
    }
  ]
}
```

---

## 6. End-to-End Verification & Test Results

All 21 backend unit and integration tests passed cleanly:
- `test_fraud_detection_engine`: Verified evaluation logic across Allow, Review, and Block thresholds.
- `test_shap_service`: Confirmed correct calculation of SHAP values and output formatting.
- `test_api_endpoints`: Verified OpenAPI contracts, status codes, and error handlers.
- `frontend_production_build`: Transformed 2352 modules with 0 errors.

---

## 7. Operational Recommendations & Future Scope

1. **Kafka / Event Streaming Integration**: Scale ingestion to handle >50,000 requests/second with distributed message queues.
2. **Graph Neural Networks (GNN)**: Deploy PyTorch Geometric models to track complex fraud rings and dynamic card-sharing networks.
3. **Automated Retraining Loop**: Implement continuous model evaluation with automated fallback in case of model drift.
