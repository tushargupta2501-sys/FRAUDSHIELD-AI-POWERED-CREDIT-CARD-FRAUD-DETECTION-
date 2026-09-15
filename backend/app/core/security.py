import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from app.config import settings

logger = logging.getLogger("sentinel.security")

security_scheme = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for demo access


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a signed JWT access token.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.API_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a signed JWT access token.
    """
    try:
        payload = jwt.decode(token, settings.API_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[Dict[str, Any]]:
    """
    Optional authentication dependency.
    If a valid JWT bearer token is present, returns user context payload.
    Otherwise returns demo analyst user context.
    """
    if not auth or not auth.credentials:
        return {
            "sub": "demo_analyst_01",
            "username": "analyst@sentinel.ai",
            "role": "SENIOR_FRAUD_ANALYST",
            "is_demo": True
        }
    
    return decode_access_token(auth.credentials)


async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    """
    Required authentication dependency.
    Validates HTTP Bearer JWT token.
    """
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer Token header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_access_token(auth.credentials)


def generate_hmac_signature(payload_bytes: bytes, secret: str = None) -> str:
    """
    Generates SHA-256 HMAC signature for payload integrity.
    """
    import hmac
    import hashlib
    key = (secret or settings.API_SECRET_KEY).encode("utf-8")
    return hmac.new(key, payload_bytes, hashlib.sha256).hexdigest()


def verify_hmac_signature(payload_bytes: bytes, signature: str, secret: str = None) -> bool:
    """
    Constant-time verification of payload HMAC signature.
    """
    import hmac
    expected = generate_hmac_signature(payload_bytes, secret)
    return hmac.compare_digest(expected.lower(), signature.lower())

