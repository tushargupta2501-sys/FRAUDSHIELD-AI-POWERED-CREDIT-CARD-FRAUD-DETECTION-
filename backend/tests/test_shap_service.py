import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.services.shap_service import SHAPExplainabilityService, shap_service
from app.schemas.risk import SHAPFactor, ExplanationResponse

client = TestClient(app)


def test_shap_service_v_features_explanation():
    service = SHAPExplainabilityService()

    # Verify strict non-invented PCA explanations
    exp_v14 = service.format_feature_explanation("V14", 1.45, -4.5)
    exp_v10 = service.format_feature_explanation("V10", 1.12, -3.2)
    exp_v4 = service.format_feature_explanation("v4", 0.95, 3.1)

    assert exp_v14 == "V14 contributed significantly."
    assert exp_v10 == "V10 contributed significantly."
    assert exp_v4 == "V4 contributed significantly."


def test_shap_service_domain_feature_explanation():
    service = SHAPExplainabilityService()
    exp_amount = service.format_feature_explanation("amount", 0.85, 2500.0)
    exp_velocity = service.format_feature_explanation("velocity_5m", 0.65, 5)

    assert "amount" in exp_amount.lower() or "$2500.00" in exp_amount
    assert "velocity" in exp_velocity.lower() or "5" in exp_velocity


def test_shap_factors_computation():
    service = SHAPExplainabilityService()
    sample_features = {
        "V14": -4.8,
        "V10": -3.5,
        "V4": 3.2,
        "amount": 1500.0,
        "velocity_5m": 4
    }

    df_input = pd.DataFrame([sample_features])
    factors = service.compute_shap_factors(df_input, sample_features, top_k=3)

    assert len(factors) == 3
    assert all(isinstance(f, SHAPFactor) for f in factors)

    top_feature_names = [f.feature for f in factors]
    assert "V14" in top_feature_names or "V10" in top_feature_names


def test_build_explanation_response():
    service = SHAPExplainabilityService()
    shap_factors = [
        SHAPFactor(
            feature="V14",
            value="-4.8",
            contribution=1.45,
            impact="INCREASES_RISK",
            explanation="V14 contributed significantly."
        ),
        SHAPFactor(
            feature="V10",
            value="-3.5",
            contribution=1.12,
            impact="INCREASES_RISK",
            explanation="V10 contributed significantly."
        )
    ]

    response = service.build_explanation_response(
        transaction_id="tx-12345",
        fraud_probability=0.885,
        shap_factors=shap_factors
    )

    assert isinstance(response, ExplanationResponse)
    assert response.transaction_id == "tx-12345"
    assert response.fraud_probability == 0.885
    assert len(response.top_contributing_features) == 2
    assert response.human_readable_summary == [
        "V14 contributed significantly.",
        "V10 contributed significantly."
    ]


def test_explainability_api_endpoint():
    payload = {
        "card_id": "card_tok_991823",
        "user_id": "usr_test_99",
        "amount": 1850.50,
        "currency": "USD",
        "merchant_name": "HighRisk Electronics",
        "merchant_category_code": "5732",
        "card_country": "US",
        "country": "US",
        "ip_address": "192.168.1.1"
    }


    res = client.post("/api/v1/explainability/explain", json=payload)
    assert res.status_code == 200

    data = res.json()
    assert "transaction_id" in data
    assert "fraud_probability" in data
    assert "top_contributing_features" in data
    assert "human_readable_summary" in data
    assert len(data["top_contributing_features"]) > 0

    # Ensure V14 or V10 explanation examples are in summary if PCA features triggered
    summaries = " ".join(data["human_readable_summary"])
    assert "contributed significantly" in summaries or "Transaction amount" in summaries
