import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_evaluate_transaction_pipeline():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "card_id": "card_test_99",
            "user_id": "usr_9988",
            "amount": 42.50,
            "currency": "USD",
            "merchant_name": "Corner Bakery Cafe",
            "merchant_category_code": "5812",
            "country": "US",
            "ip_address": "198.51.100.1"
        }
        response = await client.post("/api/v1/transactions/evaluate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "decision" in data
        assert "risk_score" in data
        assert data["decision"] in ["ALLOW", "CHALLENGE", "BLOCK"]
        assert "shap_factors" in data
        assert "processing_time_ms" in data
