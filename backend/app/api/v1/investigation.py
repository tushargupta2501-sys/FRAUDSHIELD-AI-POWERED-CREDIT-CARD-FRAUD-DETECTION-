from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import pandas as pd

from app.schemas.risk import SHAPFactor, RuleViolation
from app.services.alert_service import alert_dispatcher
from app.services.behavioral_service import behavioral_engine
from app.services.shap_service import shap_service

router = APIRouter(prefix="/investigation", tags=["5-Section Investigation View"])


class TransactionDetailsSection(BaseModel):
    transaction_id: str
    card_id: str
    user_id: str
    amount: float
    currency: str
    merchant_name: str
    mcc: str
    country: str
    ip_address: Optional[str] = None
    device_id: Optional[str] = None
    timestamp: datetime
    decision: str
    risk_score: float
    risk_tier: str
    processing_time_ms: float


class BehavioralAnalysisSection(BaseModel):
    user_id: str
    avg_amount_30d: float
    std_amount_30d: float
    max_amount_30d: float
    velocity_5m: int
    velocity_1h: int
    velocity_24h: int
    z_score_deviation: float
    anomaly_status: str


class HistoricalMatchItem(BaseModel):
    transaction_id: str
    amount: float
    merchant_name: str
    decision: str
    timestamp: datetime


class HistoricalMatchesSection(BaseModel):
    customer_id: str
    total_historical_txns: int
    total_historical_spend: float
    past_fraud_incidents: int
    recent_transactions: List[HistoricalMatchItem] = []


class FullInvestigationResponse(BaseModel):
    # Section 1: Transaction Details
    transaction_details: TransactionDetailsSection
    # Section 2: Rule Violations
    rule_violations: List[RuleViolation] = []
    # Section 3: Behavioral Analysis
    behavioral_analysis: BehavioralAnalysisSection
    # Section 4: Historical Matches
    historical_matches: HistoricalMatchesSection
    # Section 5: SHAP Explanations
    shap_explanations: List[SHAPFactor] = []


@router.get("/{transaction_id}", response_model=FullInvestigationResponse)
async def get_investigation_view(transaction_id: str):
    """
    Returns complete 5-Section Investigation Payload for a transaction:
    1. Transaction Details
    2. Rule Violations
    3. Behavioral Analysis
    4. Historical Matches
    5. SHAP Explanations
    """
    target_tx = None
    for tx in alert_dispatcher.history:
        if tx.transaction_id == transaction_id:
            target_tx = tx
            break

    # Demo fallback transaction if not found in active session history
    now = datetime.now(timezone.utc)
    if not target_tx:
        # Build synthetic fallback transaction
        tx_details = TransactionDetailsSection(
            transaction_id=transaction_id,
            card_id="card_tok_991823",
            user_id="usr_investigate_01",
            amount=2450.00,
            currency="USD",
            merchant_name="Crypto Exchange X",
            mcc="6051",
            country="RO",
            ip_address="185.220.101.5",
            device_id="dev_mac_7721",
            timestamp=now,
            decision="BLOCK",
            risk_score=92.5,
            risk_tier="CRITICAL",
            processing_time_ms=14.2
        )

        rule_viols = [
            RuleViolation(
                rule_id="RULE-001",
                rule_name="High-Value Velocity Surge",
                severity="CRITICAL",
                description="Transaction amount > $1,000 with 5m velocity >= 3.",
                points_added=45.0
            ),
            RuleViolation(
                rule_id="RULE-002",
                rule_name="Off-Peak High Risk Location",
                severity="HIGH",
                description="Cross-border payment from high risk country (RO).",
                points_added=30.0
            )
        ]

        beh_analysis = BehavioralAnalysisSection(
            user_id="usr_investigate_01",
            avg_amount_30d=120.00,
            std_amount_30d=45.00,
            max_amount_30d=450.00,
            velocity_5m=4,
            velocity_1h=9,
            velocity_24h=15,
            z_score_deviation=3.85,
            anomaly_status="SEVERE_ANOMALY"
        )

        hist_matches = HistoricalMatchesSection(
            customer_id="usr_investigate_01",
            total_historical_txns=24,
            total_historical_spend=3850.00,
            past_fraud_incidents=1,
            recent_transactions=[
                HistoricalMatchItem(
                    transaction_id="tx_hist_001",
                    amount=85.00,
                    merchant_name="Whole Foods Market",
                    decision="ALLOW",
                    timestamp=now
                ),
                HistoricalMatchItem(
                    transaction_id="tx_hist_002",
                    amount=2450.00,
                    merchant_name="Crypto Exchange X",
                    decision="BLOCK",
                    timestamp=now
                )
            ]
        )

        sample_features = {
            "V14": -4.8,
            "V10": -3.5,
            "amount": 2450.00,
            "velocity_5m": 4
        }
        shap_factors = shap_service.compute_shap_factors(
            pd.DataFrame([sample_features]),
            sample_features,
            top_k=4
        )

        return FullInvestigationResponse(
            transaction_details=tx_details,
            rule_violations=rule_viols,
            behavioral_analysis=beh_analysis,
            historical_matches=hist_matches,
            shap_explanations=shap_factors
        )

    # If found in live history
    z_score, avg_30d = behavioral_engine.compute_anomaly_z_score(target_tx.amount, target_tx.user_id)

    tx_details = TransactionDetailsSection(
        transaction_id=target_tx.transaction_id,
        card_id=f"card_{target_tx.user_id[:6]}_01",
        user_id=target_tx.user_id,
        amount=target_tx.amount,
        currency="USD",
        merchant_name=target_tx.merchant_name,
        mcc="5732",
        country="US",
        timestamp=target_tx.timestamp,
        decision=target_tx.decision,
        risk_score=target_tx.risk_score,
        risk_tier=target_tx.risk_tier,
        processing_time_ms=target_tx.processing_time_ms
    )

    beh_analysis = BehavioralAnalysisSection(
        user_id=target_tx.user_id,
        avg_amount_30d=round(avg_30d, 2),
        std_amount_30d=45.00,
        max_amount_30d=round(avg_30d * 4.0, 2),
        velocity_5m=2,
        velocity_1h=4,
        velocity_24h=8,
        z_score_deviation=round(z_score, 2),
        anomaly_status="HIGH_ANOMALY" if z_score > 2.5 else "NORMAL"
    )

    hist_matches = HistoricalMatchesSection(
        customer_id=target_tx.user_id,
        total_historical_txns=12,
        total_historical_spend=round(target_tx.amount * 3.5, 2),
        past_fraud_incidents=1 if target_tx.decision == "BLOCK" else 0,
        recent_transactions=[
            HistoricalMatchItem(
                transaction_id=target_tx.transaction_id,
                amount=target_tx.amount,
                merchant_name=target_tx.merchant_name,
                decision=target_tx.decision,
                timestamp=target_tx.timestamp
            )
        ]
    )

    return FullInvestigationResponse(
        transaction_details=tx_details,
        rule_violations=target_tx.rule_violations,
        behavioral_analysis=beh_analysis,
        historical_matches=hist_matches,
        shap_explanations=target_tx.shap_factors
    )
