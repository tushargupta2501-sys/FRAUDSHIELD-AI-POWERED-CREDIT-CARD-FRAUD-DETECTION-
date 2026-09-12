import pytest
from app.services.rule_service import RuleEngine

def test_velocity_rule_trigger():
    engine = RuleEngine()
    points, violations = engine.evaluate_rules(
        amount=50.0,
        mcc="5411",
        country="US",
        hour_of_day=14,
        velocity_5m=5,  # Exceeds threshold of 3
        user_30d_avg=100.0
    )
    assert points >= 35.0
    assert any(v.rule_id == "RULE_VELOCITY_5M" for v in violations)

def test_sanctioned_country_trigger():
    engine = RuleEngine()
    points, violations = engine.evaluate_rules(
        amount=200.0,
        mcc="5411",
        country="RU",  # Sanctioned country
        hour_of_day=14,
        velocity_5m=0,
        user_30d_avg=150.0
    )
    assert points >= 45.0
    assert any(v.rule_id == "RULE_SANCTIONED_COUNTRY" for v in violations)

def test_legitimate_low_risk_transaction():
    engine = RuleEngine()
    points, violations = engine.evaluate_rules(
        amount=45.0,
        mcc="5411",
        country="US",
        hour_of_day=12,
        velocity_5m=0,
        user_30d_avg=50.0
    )
    assert points == 0.0
    assert len(violations) == 0
