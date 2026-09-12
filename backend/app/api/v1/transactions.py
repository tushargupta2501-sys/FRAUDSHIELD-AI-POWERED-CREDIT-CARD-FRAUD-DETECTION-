from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import List, Optional
import json

from app.schemas.transaction import TransactionEvaluateRequest
from app.schemas.risk import EvaluationResult
from app.services.security_service import security_service
from app.services.risk_service import risk_engine
from app.services.alert_service import alert_dispatcher

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/evaluate", response_model=EvaluationResult)
async def evaluate_transaction(
    payload: TransactionEvaluateRequest,
    request: Request
):
    """
    Real-time transaction risk evaluation endpoint.
    Orchestrates Security Gate -> ML -> Rules -> Behavioral -> Risk Engine -> WebSocket broadcast.
    """
    raw_body = await request.body()
    signature = request.headers.get("X-Signature")
    
    # 1. Security Gate Validation
    security_service.validate_request_security(
        payload_bytes=raw_body,
        signature=signature,
        ip_address=payload.ip_address,
        mcc=payload.merchant_category_code
    )

    # 2. Risk Engine Multi-tier Evaluation
    result = risk_engine.evaluate(payload)

    # 3. Asynchronously record and broadcast over WebSocket
    await alert_dispatcher.process_and_broadcast(result)

    return result

@router.get("", response_model=List[EvaluationResult])
async def list_transactions(
    limit: int = Query(50, ge=1, le=200),
    decision: Optional[str] = Query(None, description="Filter by ALLOW, CHALLENGE, BLOCK"),
    risk_tier: Optional[str] = Query(None, description="Filter by LOW, MEDIUM, HIGH, CRITICAL")
):
    """
    Returns recent evaluated transactions with optional filtering.
    """
    txs = alert_dispatcher.history
    if decision:
        txs = [t for t in txs if t.decision.upper() == decision.upper()]
    if risk_tier:
        txs = [t for t in txs if t.risk_tier.upper() == risk_tier.upper()]
    return txs[:limit]

@router.get("/{transaction_id}", response_model=EvaluationResult)
async def get_transaction_details(transaction_id: str):
    """
    Returns full evaluation details and SHAP factors for a specific transaction ID.
    """
    for tx in alert_dispatcher.history:
        if tx.transaction_id == transaction_id:
            return tx
    raise HTTPException(status_code=404, detail="Transaction not found in active session history")
