from typing import List, Dict, Any
from app.schemas.risk import EvaluationResult
from app.api.v1.websocket import ws_manager
import logging

logger = logging.getLogger("sentinel.alert_service")

class AlertDispatcherService:
    def __init__(self):
        # In-memory evaluation storage for fast dashboard queries and history
        self.history: List[EvaluationResult] = []

    async def process_and_broadcast(self, evaluation: EvaluationResult) -> None:
        """
        Stores evaluation result in history and broadcasts to all connected dashboard websockets.
        """
        # Store latest at the beginning
        self.history.insert(0, evaluation)
        if len(self.history) > 1000:
            self.history.pop()

        # Format WebSocket message
        msg = {
            "type": "NEW_TRANSACTION",
            "data": {
                "transaction_id": evaluation.transaction_id,
                "timestamp": evaluation.timestamp.isoformat(),
                "decision": evaluation.decision,
                "risk_score": evaluation.risk_score,
                "risk_tier": evaluation.risk_tier,
                "ml_score": evaluation.ml_score,
                "rule_violations_count": len(evaluation.rule_violations),
                "behavioral_anomaly_score": evaluation.behavioral_anomaly_score,
                "processing_time_ms": evaluation.processing_time_ms,
                "user_id": evaluation.user_id,
                "amount": evaluation.amount,
                "merchant_name": evaluation.merchant_name,
                "shap_factors": [f.model_dump() for f in evaluation.shap_factors],
                "rule_violations": [r.model_dump() for r in evaluation.rule_violations]
            }
        }
        
        await ws_manager.broadcast_json(msg)

alert_dispatcher = AlertDispatcherService()
