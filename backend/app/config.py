from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "SentinelAI Real-Time Fraud Engine"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    API_SECRET_KEY: str = "sentinel_jwt_and_hmac_super_secret_key_change_me"
    HMAC_ENABLED: bool = False
    RATE_LIMIT_PER_MINUTE: int = 120
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "*"]
    
    # Database (Defaults to SQLite for lightweight local dev, PostgreSQL for production)
    DATABASE_URL: str = "sqlite+aiosqlite:///./sentinel.db"
    
    # Risk Decision Thresholds
    RISK_THRESHOLD_ALLOW: float = 30.0
    RISK_THRESHOLD_CHALLENGE: float = 75.0
    
    # Model Weights for Ensemble
    WEIGHT_ML: float = 0.50
    WEIGHT_RULES: float = 0.30
    WEIGHT_BEHAVIORAL: float = 0.20

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
