from fastapi import APIRouter
from app.api.v1.transactions import router as transactions_router
from app.api.v1.rules import router as rules_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.websocket import router as ws_router
from app.api.v1.explainability import router as explainability_router
from app.api.v1.auth import router as auth_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.customers import router as customers_router
from app.api.v1.investigation import router as investigation_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(transactions_router)
api_router.include_router(alerts_router)
api_router.include_router(dashboard_router)
api_router.include_router(customers_router)
api_router.include_router(investigation_router)
api_router.include_router(rules_router)
api_router.include_router(analytics_router)
api_router.include_router(ws_router)
api_router.include_router(explainability_router)




@api_router.get("/status", tags=["Status"])
async def api_status():
    return {
        "status": "online",
        "pipeline": "active",
        "engines": ["SecurityGate", "XGBoost-SHAP", "RuleEngine", "BehavioralEngine", "RiskAggregator"]
    }
