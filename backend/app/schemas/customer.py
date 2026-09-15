from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class CardSchema(BaseModel):
    id: str
    masked_pan: str
    card_network: str
    expiration_date: str
    card_status: str
    credit_limit: float


class BehavioralProfileSchema(BaseModel):
    avg_amount_30d: float
    std_amount_30d: float
    max_amount_30d: float
    total_txns_30d: int
    frequent_mccs: List[str] = []
    frequent_countries: List[str] = []
    last_updated: datetime


class CustomerProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone_number: Optional[str] = None
    risk_segment: str
    created_at: datetime
    cards: List[CardSchema] = []
    behavioral_profile: Optional[BehavioralProfileSchema] = None


class CustomerTransactionItem(BaseModel):
    transaction_id: str
    card_id: str
    amount: float
    currency: str
    merchant_name: str
    mcc: str
    country: str
    decision: str
    risk_score: float
    risk_tier: str
    timestamp: datetime


class CustomerHistoryResponse(BaseModel):
    customer_id: str
    total_transactions: int
    total_spend_usd: float
    fraud_incidents_count: int
    transactions: List[CustomerTransactionItem] = []
