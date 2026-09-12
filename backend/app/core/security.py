import hmac
import hashlib
import time
from app.config import settings

def verify_hmac_signature(payload_bytes: bytes, received_signature: str, secret_key: str = None) -> bool:
    """Verify SHA-256 HMAC signature of request payload."""
    if not secret_key:
        secret_key = settings.API_SECRET_KEY
    expected = hmac.new(secret_key.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, received_signature)

def generate_hmac_signature(payload_bytes: bytes, secret_key: str = None) -> str:
    """Generate SHA-256 HMAC signature for testing or client SDK."""
    if not secret_key:
        secret_key = settings.API_SECRET_KEY
    return hmac.new(secret_key.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
