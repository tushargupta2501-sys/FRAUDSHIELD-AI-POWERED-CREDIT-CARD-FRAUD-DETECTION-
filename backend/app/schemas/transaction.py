from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class TransactionEvaluateRequest(BaseModel):
    card_id: str = Field("card_tok_demo_01", description="Card Identifier or masked PAN token", min_length=2, max_length=100)
    user_id: str = Field("cust_demo_01", description="Unique User/Customer ID", min_length=2, max_length=100)
    amount: float = Field(..., description="Transaction monetary amount", gt=0.0, le=10000000.0)
    currency: str = Field("USD", min_length=3, max_length=3)
    merchant_name: str = Field("E-Commerce Merchant", min_length=1, max_length=150)
    merchant_category_code: str = Field("5311", description="4-digit ISO 18245 MCC", min_length=2, max_length=10)
    country: str = Field("US", min_length=2, max_length=2)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    device_id: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = Field(None, max_length=45)

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def map_aliases_and_defaults(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map aliases
            if "customer_id" in data and "user_id" not in data:
                data["user_id"] = data["customer_id"]
            if "card_token" in data and "card_id" not in data:
                data["card_id"] = data["card_token"]
            if "merchant_category" in data and "merchant_category_code" not in data:
                data["merchant_category_code"] = str(data["merchant_category"])
            if "mcc" in data and "merchant_category_code" not in data:
                data["merchant_category_code"] = str(data["mcc"])
            
            # Defaults for mandatory fields if omitted
            if "card_id" not in data or not data["card_id"]:
                data["card_id"] = "card_tok_demo_01"
            if "user_id" not in data or not data["user_id"]:
                data["user_id"] = "cust_demo_01"
            if "merchant_name" not in data or not data["merchant_name"]:
                data["merchant_name"] = "E-Commerce Merchant"
            if "merchant_category_code" not in data or not data["merchant_category_code"]:
                data["merchant_category_code"] = "5311"
        return data

    @field_validator("merchant_category_code")
    @classmethod
    def validate_mcc(cls, v: str) -> str:
        s = str(v).strip()
        if not s.isdigit():
            return "5311"
        return s[:4].zfill(4)

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
