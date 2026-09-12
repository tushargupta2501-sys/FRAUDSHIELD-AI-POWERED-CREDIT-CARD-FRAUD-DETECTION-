import pytest
from app.services.ml_service import MLInferenceService

def test_ml_inference_loaded():
    service = MLInferenceService()
    assert service.is_loaded is True
    assert service.model is not None
    assert service.preprocessor is not None

def test_ml_prediction_with_shap():
    service = MLInferenceService()
    feature_dict = {
        "amount": 2500.0,
        "hour_of_day": 3,
        "velocity_5m": 5,
        "velocity_1h": 12,
        "velocity_24h": 20,
        "user_30d_avg": 80.0,
        "amount_to_avg_ratio": 31.25,
        "is_foreign": 1,
        "is_night": 1,
        "is_high_risk_mcc": 1,
        "mcc": "5732",
        "country": "RO"
    }
    prob, shap_factors = service.predict(feature_dict)
    assert 0.0 <= prob <= 1.0
    assert prob > 0.7  # Clear high risk fraud pattern
    assert len(shap_factors) > 0
