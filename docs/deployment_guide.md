# SentinelAI — Dockerization, Build, Run & Deployment Guide

This guide provides instructions for containerizing, building, running, and deploying the complete SentinelAI system (**FastAPI Backend**, **React Frontend**, **PostgreSQL 16**, **Redis Cache**).

---

## 1. Prerequisites

- **Docker Desktop** (version 24.0+) or **Docker Engine & Docker Compose v2**
- **Node.js** (v20+) for local non-Docker frontend runs
- **Python** (v3.11+) for local non-Docker backend runs

---

## 2. Environment Setup

Copy `.env.example` to create your local `.env` configuration file:

```bash
cp .env.example .env
```

---

## 3. Build Commands

### A. Build Complete Multi-Container Stack (Docker Compose)
To build all Docker images (`backend`, `frontend`, `postgres`, `redis`) without starting them:

```bash
docker compose build
```

### B. Build Individual Service Images

**Backend Image**:
```bash
docker build -t sentinel-backend:latest ./backend
```

**Frontend Production Nginx Image**:
```bash
docker build -t sentinel-frontend:latest ./frontend
```

---

## 4. Run Commands

### A. Start Complete Production Stack (Background Daemon)
To launch all services in detached mode:

```bash
docker compose up -d
```

### B. View Running Container Logs
To stream logs from all containers or a specific service:

```bash
# All containers
docker compose logs -f

# Backend container only
docker compose logs -f backend

# Frontend container only
docker compose logs -f frontend
```

### C. Stop & Remove Container Stack
```bash
# Stop containers
docker compose down

# Stop containers & erase persistent volumes
docker compose down -v
```

---

## 5. Local Non-Docker Development Execution

### A. Run Backend locally
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### B. Run Frontend locally
```bash
cd frontend
npm install
npm run dev
```

Access the UI at `http://localhost:5173`.

---

## 6. Service Endpoints & Health Check Ports

| Service | Container Port | Host Port | Health Check / Route |
| :--- | :--- | :--- | :--- |
| **React Frontend (Nginx)** | `80` | `3000` | `http://localhost:3000` |
| **FastAPI Backend Gateway** | `8000` | `8000` | `http://localhost:8000/health` |
| **PostgreSQL Database** | `5432` | `5432` | `pg_isready` |
| **Redis Cache** | `6379` | `6379` | `redis-cli ping` |

---

## 7. Production Cloud Deployment Guide

### A. AWS ECS (Elastic Container Service) / Fargate
1. Push images to **AWS ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker tag sentinel-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/sentinel-backend:latest
   docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/sentinel-backend:latest
   ```
2. Provision an AWS RDS PostgreSQL 16 instance.
3. Deploy ECS Task Definitions using Fargate for `backend` and `frontend`.

### B. Single Instance Server (DigitalOcean Droplet / AWS EC2)
1. Install Docker & Docker Compose on Ubuntu 22.04 LTS.
2. Clone repository & copy `.env`.
3. Run `docker compose up -d`.
4. Configure SSL via Certbot Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d sentinel.yourdomain.com
   ```
