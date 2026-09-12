from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re

class TransactionEvaluateRequest(BaseModel):
    card_id: str = Field(..., description="Card Identifier or masked PAN token", min_length=3, max_length=50)
    user_id: str = Field(..., description="Unique User/Customer ID", min_length=3, max_length=50)
    amount: float = Field(..., description="Transaction monetary amount", gt=0.0, le=1000000.0)
    currency: str = Field("USD", min_length=3, max_length=3)
    merchant_name: str = Field(..., min_length=2, max_length=150)
    merchant_category_code: str = Field(..., description="4-digit ISO 18245 MCC", min_length=4, max_length=4)
    country: str = Field("US", min_length=2, max_length=2)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    device_id: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = Field(None, max_length=45)

    @field_validator("merchant_category_code")
    @classmethod
    def validate_mcc(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("MCC must be a 4-digit numeric code")
        return v

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: str) -> str:
        return v.upper()


class TransactionResponse(BaseModel):
    id: str
    card_id: str
    user_id: str
    amount: float
    currency: str
    merchant_name: str
    mcc: str
    country: str
    timestamp: datetime
    status: str

    model_config = {"from_attributes": True}
