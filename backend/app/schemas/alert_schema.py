from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.schemas.risk import SHAPFactor, RuleViolation


class FraudAlertResponse(BaseModel):
    id: str
    transaction_id: str
    user_id: str
    amount: float
    merchant_name: str
    risk_score: float
    risk_tier: str
    decision: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    status: str  # OPEN, UNDER_REVIEW, RESOLVED_FRAUD, RESOLVED_FALSE_POSITIVE
    assigned_analyst: Optional[str] = None
    created_at: datetime
    rule_violations: List[RuleViolation] = []
    shap_factors: List[SHAPFactor] = []


class FraudCaseResponse(BaseModel):
    case_id: str
    alert_id: str
    transaction_id: str
    customer_id: str
    customer_name: str
    amount: float
    merchant_name: str
    decision: str
    risk_score: float
    status: str
    severity: str
    created_at: datetime
    assigned_to: Optional[str] = None
    investigation_notes: Optional[str] = None
