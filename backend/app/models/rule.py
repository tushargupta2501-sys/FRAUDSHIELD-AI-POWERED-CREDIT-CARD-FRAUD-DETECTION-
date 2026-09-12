from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON, Text
from datetime import datetime, timezone
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class FraudRule(Base):
    __tablename__ = "rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rule_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    condition_type = Column(String(50), nullable=False)  # VELOCITY, AMOUNT_THRESHOLD, MCC_BLOCK, GEO_SANCTION, NIGHT_BURST
    parameters = Column(JSON, default=dict)  # e.g., {"max_count": 3, "window_minutes": 5, "min_amount": 1000}
    severity = Column(String(20), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    weight = Column(Float, default=25.0)  # Risk points added when triggered
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
