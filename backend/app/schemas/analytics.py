from pydantic import BaseModel
from typing import List, Dict, Any

class SystemSummary(BaseModel):
    total_transactions: int
    total_flagged_fraud: int
    total_challenged: int
    total_allowed: int
    fraud_rate_percentage: float
    total_volume_usd: float
    prevented_loss_usd: float
    average_latency_ms: float
    model_accuracy_f1: float
    active_rules_count: int

class TimeSeriesPoint(BaseModel):
    timestamp: str
    legitimate_count: int
    challenged_count: int
    fraud_blocked_count: int
    average_risk_score: float

class GlobalFeatureImportance(BaseModel):
    feature: str
    mean_abs_shap: float
    description: str
