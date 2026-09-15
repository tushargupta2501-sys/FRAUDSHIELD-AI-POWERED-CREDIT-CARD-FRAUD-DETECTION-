# SentinelAI: Next-Gen Hybrid Credit Card Fraud Detection Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![SHAP](https://img.shields.io/badge/SHAP-0.44.0-FF6F00.svg)](https://shap.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)

SentinelAI is an enterprise-grade, hybrid artificial intelligence platform engineered to detect credit card fraud in real time. By fusing **Extreme Gradient Boosting (XGBoost)** machine learning models with a **Deterministic Rule Engine**, real-time **Behavioral Analysis**, **Historical Intelligence**, and **TreeSHAP Explainability**, SentinelAI delivers sub-second risk decisions while ensuring complete transparency for fraud analysts and compliance auditors.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Architecture](#4-architecture)
5. [Dataset](#5-dataset)
6. [Dataset Limitations](#6-dataset-limitations)
7. [ML Pipeline](#7-ml-pipeline)
8. [Model Comparison](#8-model-comparison)
9. [Rule Engine](#9-rule-engine)
10. [Behavioral Analysis](#10-behavioral-analysis)
11. [Risk Scoring](#11-risk-scoring)
12. [Historical Intelligence](#12-historical-intelligence)
13. [SHAP Explainability](#13-shap-explainability)
14. [API Documentation](#14-api-documentation)
15. [Installation](#15-installation)
16. [Docker Setup](#16-docker-setup)
17. [Demo Guide](#17-demo-guide)
18. [Future Scope](#18-future-scope)

---

## 1. Project Overview

Modern payment processing networks process tens of thousands of transactions per second. Fraudulent actors employ sophisticated techniques including credential stuffing, account takeover, carding attacks, velocity abuse, and geo-velocity spoofing. Legacy fraud detection systems rely either on static hardcoded rules (which miss novel attack vectors) or black-box machine learning models (which lack regulatory explainability and generate high false-positive rates).

SentinelAI addresses these challenges by providing:
- **Hybrid Scoring Engine**: Combines deterministic hard safety rules with probabilistic machine learning predictions.
- **Real-Time Risk Decisioning**: Evaluates microsecond velocity windows, amount z-scores, and historical risk markers.
- **Transparent Explainability**: Employs TreeSHAP feature attribution to convert opaque model outputs into human-readable regulatory audit trails.
- **Analyst Investigation Workbench**: Provides visual telemetry, transaction history, behavioral graphs, and interactive case management UI.

---

## 2. Problem Statement

Financial institutions face three critical bottlenecks in card fraud operations:

1. **Extreme Class Imbalance**: Real-world fraud represents less than 0.17% of total transaction volume. Models trained on raw data suffer from extreme bias toward the majority class (legitimate transactions).
2. **False Positive Fatigue**: High false-positive rates frustrate legitimate customers, lead to card rejections at point-of-sale, and overload fraud investigation teams with false alarms.
3. **The "Black-Box" Explainability Barrier**: Regulatory directives (such as GDPR Article 22 and FCRA) mandate a "Right to Explanation" for automated financial decisions. Pure deep learning or ensemble models fail to provide actionable rationale for rejected transactions.

---

## 3. Proposed Solution

SentinelAI implements a multi-layered defense architecture:

```
                  ┌──────────────────────────────────────────────┐
                  │          Incoming Card Transaction            │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    Layer 1: Deterministic Rule Engine         │
                  │   (Velocity, Off-Peak, Geo, Blacklists)      │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    Layer 2: ML Probability & SHAP Service    │
                  │    (XGBoost / Random Forest + TreeSHAP)      │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    Layer 3: Behavioral & Historical Intel    │
                  │    (Customer Profiles, Device/IP Matches)    │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    Layer 4: Risk Calibration Engine          │
                  │ Final Score = 0.50*ML + 0.35*Rules + 0.15*Hist│
                  └──────────────────────┬───────────────────────┘
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
            [ ALLOW (<30) ]     [ REVIEW (30-69) ]     [ BLOCK (>=70) ]
```

1. **Rule Engine**: Immediately intercepts hard boundary violations (e.g., transaction amount > $10,000 during off-peak hours, rapid velocity spikes).
2. **Supervised ML Model**: Trained on SMOTE-balanced transaction embeddings to calculate continuous probability metrics $P(\text{fraud})$.
3. **SHAP Feature Attribution**: Extracts mathematical marginal contributions for each input parameter without misinterpreting anonymized PCA features.
4. **Weighted Ensemble Risk Score**: Aggregates machine learning probabilities, rule penalties, and historical flag counts into a normalized score ($0 - 100$).

---

## 4. Architecture

SentinelAI follows a modular, enterprise-ready microservice architecture built with Python FastAPI and React.

```
                    ┌───────────────────────────────────┐
                    │      React 18 Frontend UI         │
                    │ (TailwindCSS, Recharts, Axios)    │
                    └─────────────────┬─────────────────┘
                                      │ REST API / JSON
                                      ▼
                    ┌───────────────────────────────────┐
                    │       FastAPI Gateway Engine      │
                    │  (Async Routes, Pydantic, CORS)   │
                    └─────────────────┬─────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│ ML & SHAP Core  │          │  Rule Engine    │          │ DB & Analytics  │
│ (Joblib Model,  │          │ (Velocity, Geo, │          │ (SQLAlchemy,   │
│ SHAP TreeExpl)  │          │  MCC, Amount)   │          │ SQLite/Postgres)│
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

- **Frontend**: React 18 SPA with TailwindCSS, Lucide Icons, and Recharts visualization.
- **Backend API**: FastAPI asynchronous web framework with Pydantic schema validation.
- **Database**: SQLite (default dev/test) / PostgreSQL (production) managed via async SQLAlchemy ORM.
- **ML Runtime**: Scikit-Learn, XGBoost, LightGBM, and SHAP execution pipeline.

---

## 5. Dataset

SentinelAI leverages the benchmark **Credit Card Fraud Detection Dataset** (originating from ULB Machine Learning Group):

- **Total Transactions**: 284,807 card transactions recorded over 2 days (September 2013).
- **Legitimate Transactions**: 284,315 (99.83%)
- **Fraudulent Transactions**: 492 (0.172%)
- **Feature Vector**:
  - `Time`: Seconds elapsed between each transaction and the first transaction in the dataset.
  - `Amount`: Transaction monetary amount in USD.
  - `V1` – `V28`: Principal Component Analysis (PCA) features extracted to preserve user privacy and cardholder data confidentiality.
  - `Class`: Response variable (0 = Legitimate, 1 = Fraudulent).

---

## 6. Dataset Limitations

While effective for machine learning benchmarking, the dataset exhibits specific real-world limitations:

1. **Extreme Class Imbalance**: 492 positive samples require synthetic oversampling (SMOTE) during training, which can introduce synthetic noise near decision boundaries.
2. **Anonymized PCA Features (`V1` - `V28`)**: Raw domain attributes (e.g., merchant ID, cardholder age, terminal type, device fingerprint) are compressed into principal components. 
3. **No Direct Domain Meanings for PCA Features**: `V1` through `V28` represent mathematical orthogonal projections. **SentinelAI strictly avoids inventing false domain meanings** (e.g., claiming V14 means "card age") and instead describes their mathematical impact neutrally (e.g., *"V14 contributed significantly to the risk increase"*).
4. **Short Time Horizon**: Data spans 48 hours, limiting seasonal, day-of-week, and long-term behavioral trend modeling.

---

## 7. ML Pipeline

The machine learning pipeline enforces rigorous preprocessing, resampling, and model selection:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Raw Dataset     │───>│ Robust Scaling  │───>│ SMOTE Resampling│
│ (284k records)  │    │ (Amount & Time) │    │ (Training Set)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ SHAP Explanation│<───│ Optimal Model   │<───│ Hyperparameter  │
│ Matrix Output   │    │ (XGBoost Classifier) │ Tuning (GridSearch)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **Preprocessing & Feature Engineering**: Standard scaling of `Amount` and `Time` features alongside raw `V1`–`V28` inputs.
2. **Train/Test Split**: Stratified 80/20 train-test split maintaining ratio of positive fraud cases.
3. **Class Balancing**: Synthetic Minority Over-sampling Technique (SMOTE) applied *exclusively* to the training set to prevent data leakage into validation/testing sets.
4. **Hyperparameter Tuning**: Stratified 5-Fold Cross-Validation targeting maximum **PR-AUC (Precision-Recall Area Under Curve)** and **Recall@95% Precision**.

---

## 8. Model Comparison

Four candidate model architectures were evaluated on identical test splits:

| Model Architecture | Precision | Recall | F1-Score | ROC-AUC | PR-AUC | Latency (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost Classifier (Selected)** | **0.942** | **0.887** | **0.914** | **0.984** | **0.921** | **4.2 ms** |
| LightGBM | 0.928 | 0.875 | 0.901 | 0.979 | 0.908 | 3.1 ms |
| Random Forest | 0.915 | 0.842 | 0.877 | 0.965 | 0.884 | 12.8 ms |
| Logistic Regression | 0.082 | 0.898 | 0.150 | 0.924 | 0.712 | 1.1 ms |

> **Selection Rationale**: XGBoost provided the highest PR-AUC (0.921) and F1-Score (0.914) while maintaining sub-5ms inference speeds suitable for real-time API integrations.

---

## 9. Rule Engine

The deterministic rule engine evaluates transactions against key operational heuristics:

- **HIGH_AMOUNT_OFF_PEAK**: Transaction amount exceeds $1,000 between 00:00 and 05:00 UTC. Penalty: +35 points.
- **RAPID_VELOCITY**: Customer attempts > 3 transactions within a 60-second window. Penalty: +40 points.
- **HIGH_RISK_MCC**: Transaction initiated under high-risk Merchant Category Codes (e.g., MCC 5944 - Jewelry, MCC 7995 - Gambling). Penalty: +25 points.
- **AMOUNT_DEV_HIGH**: Transaction amount exceeds 3.5 standard deviations from the customer's historical mean. Penalty: +30 points.
- **IP_DEVICE_MISMATCH**: IP geolocation country differs from card issuance country. Penalty: +30 points.

---

## 10. Behavioral Analysis

SentinelAI tracks per-customer dynamic state variables across rolling temporal windows:

```
                             [ Customer State Store ]
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
  Rolling Velocity             Amount Distribution          Geographic Tracking
  (Count in 1m, 1h, 24h)       (Mean, StdDev, Z-Score)      (Last Known IP / Device)
```

- **Z-Score Calculation**: 
  $$Z = \frac{x - \mu_{\text{customer}}}{\sigma_{\text{customer}}}$$
- **Velocity Spikes**: Detects automated card-testing bots by monitoring request spikes per card token in 60-second sliding windows.
- **Merchant Diversity**: Flags unusual rapid shifting between high-value retail categories.

---

## 11. Risk Scoring

The SentinelAI Risk Engine synthesizes signals into a unified scale of **0 to 100**:

$$\text{Final Risk Score} = \left( 0.50 \times S_{\text{ML}} \right) + \left( 0.35 \times S_{\text{Rules}} \right) + \left( 0.15 \times S_{\text{Hist}} \right)$$

Where:
- $S_{\text{ML}} = P(\text{fraud}) \times 100$
- $S_{\text{Rules}} = \min(100, \sum \text{Rule Penalties})$
- $S_{\text{Hist}} = \min(100, \text{Past Fraud Count} \times 35)$

### Actionable Risk Tiers:

| Risk Score | Tier | Decision | Operational Action |
| :---: | :---: | :---: | :--- |
| **0 – 29** | Low Risk | **ALLOW** | Transaction auto-approved. |
| **30 – 69** | Medium Risk | **REVIEW** | Flagged for manual analyst review in Dashboard. |
| **70 – 100** | High Risk | **BLOCK** | Transaction declined instantly at payment gateway. |

---

## 12. Historical Intelligence

SentinelAI maintains a persistent intelligence ledger of past fraudulent entities:

- **Entity Blacklisting**: Automated indexing of confirmed fraudulent Card Tokens, Device Fingerprints, IP Subnets, and Shipping Addresses.
- **Historical Cross-Matching**: Incoming transactions are matched against entity records. Matches trigger instantaneous score boosts ($S_{\text{Hist}}$) and issue alerts to security analysts.
- **Case History Tracking**: Fraud analysts can mark transaction outcomes (Confirmed Fraud vs. False Positive), dynamically retraining risk parameters.

---

## 13. SHAP Explainability

To satisfy strict regulatory requirements without sacrificing model performance, SentinelAI embeds **TreeSHAP** (SHapley Additive exPlanations):

- **Additive Attribution**:
  $$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i$$
  where $\phi_0$ is the base value and $\phi_i$ is the impact score of feature $i$.
- **PCA Neutral Attribution Rules**:
  Anonymized features `V1`–`V28` are explained through mathematical influence rather than fabricated real-world meanings:
  - *Example 1*: `"V14 contributed significantly to the risk increase (+0.32 SHAP value)."`
  - *Example 2*: `"V10 contributed significantly to lowering risk (-0.18 SHAP value)."`
  - *Example 3*: `"Transaction Amount ($1,450.00) increased fraud risk (+0.12 SHAP value)."`

---

## 14. API Documentation

SentinelAI provides a RESTful FastAPI backend. Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

### Core Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/transactions/check` | Analyze transaction risk in real time. |
| `GET` | `/api/v1/transactions` | Query recent transactions with pagination/filters. |
| `GET` | `/api/v1/transactions/{id}` | Retrieve transaction details. |
| `GET` | `/api/v1/explainability/{id}` | Get detailed SHAP feature attributions for a transaction. |
| `GET` | `/api/v1/investigation/{id}` | Fetch 5-section investigation data package for analysts. |
| `GET` | `/api/v1/dashboard/stats` | Fetch aggregate risk metrics, trends, and distribution. |
| `GET` | `/api/v1/fraud-alerts` | Retrieve active fraud alerts. |
| `GET` | `/api/v1/fraud-cases` | Retrieve open investigation cases. |
| `GET` | `/api/v1/customers/{id}/profile` | Retrieve customer behavioral profile. |
| `GET` | `/api/v1/customers/{id}/history` | Retrieve historical transactions for a customer. |
| `POST` | `/api/v1/auth/token` | Obtain JWT authorization token. |

---

## 15. Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### Quickstart Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tushargupta2501-sys/FRAUDSHIELD-AI-POWERED-CREDIT-CARD-FRAUD-DETECTION-.git
   cd FRAUDSHIELD-AI-POWERED-CREDIT-CARD-FRAUD-DETECTION-
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   # source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Train Machine Learning Model (Optional - Pretrained Model Provided)**:
   ```bash
   python -m ml_pipeline.train
   ```

4. **Run Backend Service**:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

5. **Setup & Run Frontend**:
   ```bash
   # Open a new terminal window
   cd frontend
   npm install
   npm run dev
   ```

6. **Access UI**: Navigate to `http://localhost:5173`.

---

## 16. Docker Setup

Deploy SentinelAI containerized with single-command setup using Docker Compose.

### Docker Environment Files
Ensure your `.env` file exists in the root directory (copied from `.env.example`):
```bash
cp .env.example .env
```

### Build & Run Containers
```bash
docker-compose up --build -d
```

### Active Containers
- **Frontend Container**: Nginx server delivering production React assets (`http://localhost:3000`).
- **Backend Container**: FastAPI app running with Uvicorn (`http://localhost:8000`).
- **Database Container**: PostgreSQL 15 database instance storing transactions, rules, and audit logs.

### Command Controls
```bash
# Check container status
docker-compose ps

# View backend logs
docker-compose logs -f backend

# Shutdown containers
docker-compose down -v
```

---

## 17. Demo Guide

Follow these steps to perform a complete demonstration of SentinelAI:

1. **Log In**:
   - Open `http://localhost:5173`.
   - Enter demo credentials (`admin@sentinel.ai` / `admin123`) or click **"Demo Login"**.

2. **Run Legitimate Transaction Simulation**:
   - Navigate to **Transaction Simulator**.
   - Select **"Legitimate Low-Risk Purchase"** preset.
   - Click **"Evaluate Transaction Risk"**.
   - Observe **ALLOW** decision, low risk score (<15), and zero rule penalties.

3. **Run Fraudulent Velocity & Off-Peak Simulation**:
   - Select **"High-Risk Fraud Scenario"** preset (Amount: $4,500, Time: 02:30 AM, high V14/V10 variance).
   - Click **"Evaluate Transaction Risk"**.
   - Observe **BLOCK** or **REVIEW** recommendation with detailed rule violations listed (`HIGH_AMOUNT_OFF_PEAK`, `AMOUNT_DEV_HIGH`).

4. **Inspect Decision Explainability**:
   - Click **"View Full Investigation"** or navigate to **Investigation Dashboard**.
   - Expand the **SHAP Explanation** panel.
   - Verify top feature attributions (e.g., *"V14 contributed significantly (+0.34)"*).

5. **Explore Admin Dashboard**:
   - Review live analytics: Fraud vs. Legit ratio, Geographic Risk Map, Merchant Category distribution, and hourly risk trends.

---

## 18. Future Scope

1. **Graph Neural Networks (GNN)**: Incorporate graph topologies (PyTorch Geometric) to detect syndicate fraud rings and shared entity graphs.
2. **Streaming Pipeline**: Integrate Apache Kafka and Flink for sub-millisecond event streaming processing.
3. **Adaptive Online Learning**: Implement incremental online model retraining to adapt dynamically to evolving fraud patterns without full batch re-trains.
4. **Biometric & Device Telemetry**: Incorporate mobile device gyro-sensors, typing cadence, and behavioral biometrics.

---

## License

Distributed under the MIT License. See `LICENSE` for details.