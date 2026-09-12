from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    risk_assessment_id = Column(String(36), ForeignKey("risk_assessments.id"), unique=True, nullable=False)
    severity = Column(String(20), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="OPEN")  # OPEN, UNDER_REVIEW, RESOLVED_FRAUD, RESOLVED_FALSE_POSITIVE
    assigned_analyst = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    risk_assessment = relationship("RiskAssessment", back_populates="fraud_alert")
