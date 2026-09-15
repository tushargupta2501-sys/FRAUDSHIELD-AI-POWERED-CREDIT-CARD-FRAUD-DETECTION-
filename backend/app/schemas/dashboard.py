from pydantic import BaseModel
from typing import Dict, Any, List


class RiskTierDistribution(BaseModel):
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    critical_risk_count: int


class DashboardStatsResponse(BaseModel):
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
    risk_tier_distribution: RiskTierDistribution


# Chart 1: Fraud vs Legit
class FraudVsLegitPoint(BaseModel):
    name: str
    count: int
    percentage: float
    color: str


# Chart 2: Fraud by Location
class FraudByLocationPoint(BaseModel):
    country: str
    country_name: str
    total_txns: int
    fraud_count: int
    fraud_rate_percentage: float


# Chart 3: Fraud by Merchant
class FraudByMerchantPoint(BaseModel):
    merchant_category: str
    merchant_name: str
    fraud_count: int
    blocked_volume_usd: float


# Chart 4: Fraud Trend
class FraudTrendPoint(BaseModel):
    timestamp: str
    legitimate_count: int
    challenged_count: int
    fraud_blocked_count: int
    avg_risk_score: float


# Chart 5: Risk Distribution
class RiskDistributionPoint(BaseModel):
    tier: str
    label: str
    count: int
    percentage: float
    color: str


class DashboardChartsResponse(BaseModel):
    fraud_vs_legit: List[FraudVsLegitPoint]
    fraud_by_location: List[FraudByLocationPoint]
    fraud_by_merchant: List[FraudByMerchantPoint]
    fraud_trend: List[FraudTrendPoint]
    risk_distribution: List[RiskDistributionPoint]
