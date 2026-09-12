from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone_number = Column(String(30), nullable=True)
    risk_segment = Column(String(30), default="STANDARD")  # STANDARD, HIGH_NET_WORTH, PROBATIONARY
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    cards = relationship("Card", back_populates="user", cascade="all, delete-orphan")
    behavioral_profile = relationship("BehavioralProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Card(Base):
    __tablename__ = "cards"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    masked_pan = Column(String(20), nullable=False)
    card_network = Column(String(30), default="VISA")  # VISA, MASTERCARD, AMEX
    expiration_date = Column(String(7), nullable=False)  # MM/YYYY
    card_status = Column(String(20), default="ACTIVE")  # ACTIVE, BLOCKED, SUSPENDED
    credit_limit = Column(Float, default=5000.0)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="cards")


class BehavioralProfile(Base):
    __tablename__ = "behavioral_profiles"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    avg_amount_30d = Column(Float, default=120.0)
    std_amount_30d = Column(Float, default=45.0)
    max_amount_30d = Column(Float, default=450.0)
    total_txns_30d = Column(Integer, default=25)
    frequent_mccs = Column(JSON, default=list)  # List of commonly used MCC strings
    frequent_countries = Column(JSON, default=lambda: ["US"])
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="behavioral_profile")
