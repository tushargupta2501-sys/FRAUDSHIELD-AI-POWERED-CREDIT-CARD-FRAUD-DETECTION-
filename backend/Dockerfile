FROM python:3.11-slim

WORKDIR /app

# Install system build dependencies and OpenMP (required for XGBoost & TreeSHAP)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code & ML artifacts
COPY . .

# Expose FastAPI Gateway port
EXPOSE 8000

# Container Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start Uvicorn ASGI production server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
