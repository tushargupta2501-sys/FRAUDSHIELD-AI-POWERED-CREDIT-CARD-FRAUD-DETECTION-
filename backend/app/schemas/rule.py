from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class RuleBase(BaseModel):
    rule_code: str
    name: str
    description: Optional[str] = None
    condition_type: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    severity: str = "HIGH"
    weight: float = 25.0
    is_active: bool = True

class RuleCreate(RuleBase):
    pass

class RuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    severity: Optional[str] = None
    weight: Optional[float] = None
    is_active: Optional[bool] = None

class RuleResponse(RuleBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}
