from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import timedelta

from app.core.security import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str = Field("analyst@sentinel.ai", json_schema_extra={"example": "analyst@sentinel.ai"})
    password: str = Field("sentinel123", json_schema_extra={"example": "sentinel123"})



class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user_info: Dict[str, Any]


@router.post("/login", response_model=TokenResponse)
@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(request: Request):
    """
    Demo JWT Authentication Token endpoint.
    Supports both JSON payloads and OAuth2 form urlencoded requests.
    Generates a 24-hour JWT bearer token for API access.
    """
    username = "analyst@sentinel.ai"
    password = "sentinel123"

    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        try:
            form = await request.form()
            username = form.get("username") or username
            password = form.get("password") or password
        except Exception:
            pass
    else:
        try:
            body = await request.json()
            if isinstance(body, dict):
                username = body.get("username") or body.get("user") or username
                password = body.get("password") or body.get("pass") or password
        except Exception:
            pass

    user_info = {
        "sub": username,
        "role": "SENIOR_FRAUD_ANALYST",
        "permissions": ["READ_TRANSACTIONS", "WRITE_RULES", "INVESTIGATE_ALERTS"]
    }
    token = create_access_token(data=user_info)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_info=user_info
    )


@router.get("/me")
async def get_auth_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns authenticated user session details.
    """
    return {
        "status": "authenticated",
        "user": current_user
    }
