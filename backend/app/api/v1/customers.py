from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime, timezone

from app.schemas.customer import (
    CustomerProfileResponse,
    CustomerHistoryResponse,
    CustomerTransactionItem,
    CardSchema,
    BehavioralProfileSchema
)
from app.services.alert_service import alert_dispatcher
from app.services.behavioral_service import behavioral_engine

router = APIRouter(prefix="/customers", tags=["Customer Profiles & History"])


@router.get("/{customer_id}/profile", response_model=CustomerProfileResponse)
async def get_customer_profile(customer_id: str):
    """
    Returns full customer profile details, credit cards, and 30-day behavioral baselines.
    """
    # Fetch behavioral baseline metrics from behavioral engine
    z_score, avg_30d = behavioral_engine.compute_anomaly_z_score(100.0, customer_id)

    # Build customer profile output
    now = datetime.now(timezone.utc)

    cards = [
        CardSchema(
            id=f"card_{customer_id[:6]}_01",
            masked_pan="4532-••••-••••-8812",
            card_network="VISA",
            expiration_date="12/2028",
            card_status="ACTIVE",
            credit_limit=7500.0
        ),
        CardSchema(
            id=f"card_{customer_id[:6]}_02",
            masked_pan="5412-••••-••••-1902",
            card_network="MASTERCARD",
            expiration_date="08/2027",
            card_status="ACTIVE",
            credit_limit=12000.0
        )
    ]

    beh_profile = BehavioralProfileSchema(
        avg_amount_30d=round(avg_30d, 2),
        std_amount_30d=45.0,
        max_amount_30d=round(avg_30d * 4.5, 2),
        total_txns_30d=34,
        frequent_mccs=["5411", "5812", "5541"],
        frequent_countries=["US", "CA"],
        last_updated=now
    )

    return CustomerProfileResponse(
        id=customer_id,
        full_name=f"Customer ({customer_id[:8]})",
        email=f"{customer_id.lower()}@customer-sentinel.io",
        phone_number="+1 (555) 234-8900",
        risk_segment="HIGH_NET_WORTH" if avg_30d > 250 else "STANDARD",
        created_at=now,
        cards=cards,
        behavioral_profile=beh_profile
    )


@router.get("/{customer_id}/history", response_model=CustomerHistoryResponse)
async def get_customer_transaction_history(
    customer_id: str,
    limit: int = Query(50, ge=1, le=200)
):
    """
    Returns historical transaction records for a specific customer ID.
    """
    tx_items: List[CustomerTransactionItem] = []
    history = alert_dispatcher.history

    for tx in history:
        if tx.user_id == customer_id:
            tx_items.append(CustomerTransactionItem(
                transaction_id=tx.transaction_id,
                card_id=f"card_{customer_id[:6]}_01",
                amount=tx.amount,
                currency="USD",
                merchant_name=tx.merchant_name,
                mcc="5732",
                country="US",
                decision=tx.decision,
                risk_score=tx.risk_score,
                risk_tier=tx.risk_tier,
                timestamp=tx.timestamp
            ))

    total_spend = sum(t.amount for t in tx_items)
    fraud_count = len([t for t in tx_items if t.decision in ["BLOCK", "CHALLENGE"]])

    # If no history in current session, generate initial sample history
    if len(tx_items) == 0:
        now = datetime.now(timezone.utc)
        tx_items = [
            CustomerTransactionItem(
                transaction_id=f"tx_{customer_id[:6]}_hist_01",
                card_id=f"card_{customer_id[:6]}_01",
                amount=145.50,
                currency="USD",
                merchant_name="Whole Foods Market",
                mcc="5411",
                country="US",
                decision="ALLOW",
                risk_score=8.5,
                risk_tier="LOW",
                timestamp=now
            ),
            CustomerTransactionItem(
                transaction_id=f"tx_{customer_id[:6]}_hist_02",
                card_id=f"card_{customer_id[:6]}_01",
                amount=1250.00,
                currency="USD",
                merchant_name="HighRisk Electronics",
                mcc="5732",
                country="US",
                decision="CHALLENGE",
                risk_score=68.0,
                risk_tier="HIGH",
                timestamp=now
            )
        ]
        total_spend = 1395.50
        fraud_count = 1

    return CustomerHistoryResponse(
        customer_id=customer_id,
        total_transactions=len(tx_items),
        total_spend_usd=round(total_spend, 2),
        fraud_incidents_count=fraud_count,
        transactions=tx_items[:limit]
    )
