import time
from typing import Dict, Any, Tuple
from datetime import datetime, timezone
import uuid

from app.config import settings
from app.schemas.transaction import TransactionEvaluateRequest
from app.schemas.risk import EvaluationResult, SHAPFactor, RuleViolation
from app.services.ml_service import ml_service
from app.services.rule_service import rule_engine
from app.services.behavioral_service import behavioral_engine
import logging

logger = logging.getLogger("sentinel.risk")

class RiskDecisionEngine:
    """
    Synthesizes signals from ML Engine, Rule Engine, and Behavioral Engine
    into a calibrated composite risk score (0-100) and actionable decision.
    """
    def evaluate(self, request: TransactionEvaluateRequest) -> EvaluationResult:
        start_time = time.time()
        now = datetime.now(timezone.utc)
        hour_of_day = now.hour

        # 1. Behavioral & Velocity Extraction
        v_5m, v_1h, v_24h = behavioral_engine.record_and_get_velocity(request.user_id)
        z_score, user_30d_avg = behavioral_engine.compute_anomaly_z_score(request.amount, request.user_id)
        ratio = round(request.amount / max(1.0, user_30d_avg), 2)
        is_foreign = 1 if request.country.upper() != "US" else 0
        is_night = 1 if hour_of_day in [0, 1, 2, 3, 4, 5] else 0
        is_high_risk_mcc = 1 if request.merchant_category_code in ["6051", "7995", "5732", "5944", "4829"] else 0

        # 2. ML Engine Inference & SHAP Factors
        feature_dict = {
            "amount": request.amount,
            "hour_of_day": hour_of_day,
            "velocity_5m": v_5m,
            "velocity_1h": v_1h,
            "velocity_24h": v_24h,
            "user_30d_avg": user_30d_avg,
            "amount_to_avg_ratio": ratio,
            "is_foreign": is_foreign,
            "is_night": is_night,
            "is_high_risk_mcc": is_high_risk_mcc,
            "mcc": request.merchant_category_code,
            "country": request.country.upper()
        }

        ml_prob, shap_factors = ml_service.predict(feature_dict)

        # 3. Deterministic Rule Engine Evaluation
        rule_points, rule_violations = rule_engine.evaluate_rules(
            amount=request.amount,
            mcc=request.merchant_category_code,
            country=request.country,
            hour_of_day=hour_of_day,
            velocity_5m=v_5m,
            user_30d_avg=user_30d_avg
        )

        # 4. Behavioral Score Normalization (0 to 100)
        # Anomaly index mapped to 0-100 scale: z_score of 3+ corresponds to high anomaly
        norm_behavioral_score = min(100.0, max(0.0, z_score * 20.0))

        # 5. Composite Risk Score (Weighted Ensemble)
        # Base ML contribution (0-100)
        ml_score_100 = ml_prob * 100.0

        composite_risk = (
            (settings.WEIGHT_ML * ml_score_100) +
            (settings.WEIGHT_RULES * rule_points) +
            (settings.WEIGHT_BEHAVIORAL * norm_behavioral_score)
        )
        
        # Hard overrides: If critical rule triggered or ML prob > 0.95, clamp to high risk
        if any(v.severity == "CRITICAL" for v in rule_violations) or ml_prob >= 0.95:
            composite_risk = max(composite_risk, 85.0)

        composite_risk = round(min(100.0, max(1.0, composite_risk)), 1)

        # 6. Decision Matrix & Risk Tier
        if composite_risk < settings.RISK_THRESHOLD_ALLOW:
            decision = "ALLOW"
            risk_tier = "LOW"
        elif composite_risk < settings.RISK_THRESHOLD_CHALLENGE:
            decision = "CHALLENGE"
            risk_tier = "MEDIUM" if composite_risk < 55.0 else "HIGH"
        else:
            decision = "BLOCK"
            risk_tier = "CRITICAL"

        process_time_ms = round((time.time() - start_time) * 1000.0, 2)

        return EvaluationResult(
            transaction_id=str(uuid.uuid4()),
            timestamp=now,
            decision=decision,
            risk_score=composite_risk,
            risk_tier=risk_tier,
            ml_score=round(ml_prob, 4),
            rule_violations=rule_violations,
            behavioral_anomaly_score=z_score,
            shap_factors=shap_factors,
            processing_time_ms=process_time_ms,
            user_id=request.user_id,
            amount=request.amount,
            merchant_name=request.merchant_name
        )

risk_engine = RiskDecisionEngine()
