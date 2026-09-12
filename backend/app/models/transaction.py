from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from datetime import datetime, timezone
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    card_id = Column(String(36), index=True, nullable=False)
    user_id = Column(String(36), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    merchant_name = Column(String(150), nullable=False)
    mcc = Column(String(4), nullable=False)  # Merchant Category Code
    country = Column(String(2), default="US")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    ip_address = Column(String(45), nullable=True)
    device_id = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    status = Column(String(20), default="APPROVED")  # APPROVED, DECLINED, CHALLENGED

    # Relationships
    risk_assessment = relationship("RiskAssessment", back_populates="transaction", uselist=False, cascade="all, delete-orphan")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), unique=True, nullable=False)
    risk_score = Column(Float, nullable=False)  # 0.0 - 100.0
    risk_tier = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    decision = Column(String(20), nullable=False)  # ALLOW, CHALLENGE, BLOCK
    ml_probability = Column(Float, nullable=False)  # 0.0 - 1.0
    behavioral_score = Column(Float, default=0.0)  # Z-score anomaly metric
    rule_violations = Column(JSON, default=list)  # List of violated rules
    shap_explanations = Column(JSON, default=list)  # SHAP factor attributions
    latency_ms = Column(Float, default=0.0)
    evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    transaction = relationship("Transaction", back_populates="risk_assessment")
    fraud_alert = relationship("FraudAlert", back_populates="risk_assessment", uselist=False, cascade="all, delete-orphan")
