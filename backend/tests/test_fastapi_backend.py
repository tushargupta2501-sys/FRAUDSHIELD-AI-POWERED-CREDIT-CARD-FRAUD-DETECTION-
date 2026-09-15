import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_auth_token_login():
    res = client.post("/api/auth/login", json={
        "username": "analyst@sentinel.ai",
        "password": "sentinel123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_post_transactions_check():
    payload = {
        "card_id": "card_tok_881923",
        "user_id": "usr_test_7712",
        "amount": 1499.99,
        "currency": "USD",
        "merchant_name": "ElectroMart Tech",
        "merchant_category_code": "5732",
        "country": "US",
        "ip_address": "192.168.1.50"
    }

    res = client.post("/api/transactions/check", json=payload)
    assert res.status_code == 200

    data = res.json()
    assert "transaction_id" in data
    assert "decision" in data
    assert data["decision"] in ["ALLOW", "CHALLENGE", "BLOCK"]
    assert "risk_score" in data
    assert "ml_score" in data
    assert "shap_factors" in data


def test_get_transactions_list_and_detail():
    # First ensure at least one transaction is submitted
    payload = {
        "card_id": "card_tok_112233",
        "user_id": "usr_test_1122",
        "amount": 450.00,
        "currency": "USD",
        "merchant_name": "Supermarket Prime",
        "merchant_category_code": "5411",
        "country": "US"
    }
    check_res = client.post("/api/transactions/check", json=payload)
    assert check_res.status_code == 200
    tx_id = check_res.json()["transaction_id"]

    # Test GET /api/transactions
    list_res = client.get("/api/transactions")
    assert list_res.status_code == 200
    tx_list = list_res.json()
    assert isinstance(tx_list, list)
    assert len(tx_list) > 0

    # Test GET /api/transactions/{id}
    detail_res = client.get(f"/api/transactions/{tx_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["transaction_id"] == tx_id


def test_get_fraud_alerts_and_cases():
    # GET /api/fraud-alerts
    alerts_res = client.get("/api/fraud-alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert isinstance(alerts, list)

    # GET /api/fraud-cases
    cases_res = client.get("/api/fraud-cases")
    assert cases_res.status_code == 200
    cases = cases_res.json()
    assert isinstance(cases, list)


def test_get_dashboard_stats():
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()

    assert "total_transactions" in data
    assert "fraud_rate_percentage" in data
    assert "prevented_loss_usd" in data
    assert "risk_tier_distribution" in data


def test_get_customer_profile_and_history():
    customer_id = "usr_test_7712"

    # GET /api/customers/{id}/profile
    prof_res = client.get(f"/api/customers/{customer_id}/profile")
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["id"] == customer_id
    assert "cards" in prof
    assert "behavioral_profile" in prof

    # GET /api/customers/{id}/history
    hist_res = client.get(f"/api/customers/{customer_id}/history")
    assert hist_res.status_code == 200
    hist = hist_res.json()
    assert hist["customer_id"] == customer_id
    assert "total_spend_usd" in hist
    assert "transactions" in hist


def test_get_dashboard_charts():
    res = client.get("/api/dashboard/charts")
    assert res.status_code == 200
    data = res.json()
    assert "fraud_vs_legit" in data
    assert "fraud_by_location" in data
    assert "fraud_by_merchant" in data
    assert "fraud_trend" in data
    assert "risk_distribution" in data


def test_get_investigation_view():
    res = client.get("/api/investigation/tx_test_99182")
    assert res.status_code == 200
    data = res.json()
    assert "transaction_details" in data
    assert "rule_violations" in data
    assert "behavioral_analysis" in data
    assert "historical_matches" in data
    assert "shap_explanations" in data


def test_pydantic_validation_error_handling():
    # Invalid payload missing required card_id and with invalid amount
    invalid_payload = {
        "user_id": "usr_test",
        "amount": -500.0,
        "merchant_category_code": "abc"
    }

    res = client.post("/api/transactions/check", json=invalid_payload)
    assert res.status_code == 422
    data = res.json()
    assert data["error"] == "Validation Error"
    assert "details" in data

