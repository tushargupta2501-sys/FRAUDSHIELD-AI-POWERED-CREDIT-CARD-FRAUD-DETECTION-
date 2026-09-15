from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SHAPFactor(BaseModel):
    feature: str
    value: Any
    contribution: float
    impact: str  # INCREASES_RISK, DECREASES_RISK, NEUTRAL
    explanation: str

class RuleViolation(BaseModel):
    rule_id: str
    rule_name: str
    severity: str
    description: str
    points_added: float

class EvaluationResult(BaseModel):
    transaction_id: str
    timestamp: datetime
    decision: str  # ALLOW, CHALLENGE, BLOCK
    risk_score: float  # 0.0 - 100.0
    risk_tier: str  # LOW, MEDIUM, HIGH, CRITICAL
    ml_score: float  # 0.0 - 1.0 (fraud probability)
    rule_violations: List[RuleViolation] = []
    behavioral_anomaly_score: float = 0.0  # Z-score deviation
    shap_factors: List[SHAPFactor] = []
    processing_time_ms: float
    user_id: str
    amount: float
    merchant_name: str

class ExplanationResponse(BaseModel):
    transaction_id: str
    fraud_probability: float
    base_value: float = 0.0017
    top_contributing_features: List[SHAPFactor] = []
    feature_impact_summary: Dict[str, Any] = {}
    human_readable_summary: List[str] = []

