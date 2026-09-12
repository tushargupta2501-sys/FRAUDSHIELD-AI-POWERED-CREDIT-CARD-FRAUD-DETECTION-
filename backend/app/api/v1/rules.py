from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.rule import RuleCreate, RuleUpdate
from app.services.rule_service import rule_engine

router = APIRouter(prefix="/rules", tags=["Rule Engine"])

@router.get("")
async def get_all_rules():
    """List all active and inactive fraud detection rules."""
    return rule_engine.rules

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_rule(rule: RuleCreate):
    """Add a new deterministic rule."""
    new_rule_dict = rule.model_dump()
    new_rule_dict["points"] = rule.weight
    rule_engine.rules.append(new_rule_dict)
    return {"message": "Rule created successfully", "rule": new_rule_dict}

@router.patch("/{rule_id}/toggle")
async def toggle_rule(rule_id: str):
    """Toggle a rule on or off."""
    for r in rule_engine.rules:
        if r.get("rule_id") == rule_id:
            r["is_active"] = not r.get("is_active", True)
            return {"message": f"Rule {rule_id} active state updated", "is_active": r["is_active"]}
    raise HTTPException(status_code=404, detail="Rule not found")
