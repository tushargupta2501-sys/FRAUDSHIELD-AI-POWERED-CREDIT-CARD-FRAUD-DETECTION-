# SentinelAI — Real-Time AI Fraud Detection & Transaction Security Layer

SentinelAI is an enterprise-grade, real-time transaction security and AI-powered credit card fraud detection system designed as a production-style academic prototype.

## System Architecture

```text
User/Cardholder
      │
      ▼
Transaction Form / Simulator
      │
      ▼
FastAPI Gateway
      │
      ▼
Security Layer
(HMAC Integrity, IP Token Bucket Rate Limiter, Pydantic V2 Sanitization)
      │
      ▼
ML Inference Engine
(XGBoost + Scikit-Learn + SHAP)
      │
      ▼
Risk Engine
      │
      ▼
Decision Matrix
(ALLOW | CHALLENGE | BLOCK)
      │
      ▼
PostgreSQL Database
      │
      ▼
WebSocket Broker
      │
      ▼
React Analytics Dashboard
```

## Features

- Real-time fraud detection
- XGBoost ML model
- SHAP explainability
- Behavioral profiling
- Risk scoring engine
- WebSocket live alerts
- React dashboard
- FastAPI backend
- PostgreSQL storage

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- WebSockets

### Machine Learning
- XGBoost
- Scikit-Learn
- SHAP

### Frontend
- React 18
- Tailwind CSS
- Vite
- Recharts

## Project Structure

```text
sentinel-ai/
├── backend/
├── frontend/
├── ml_pipeline/
├── docs/
├── models/
├── docker-compose.yml
└── README.md
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

## License

Academic / Educational Project