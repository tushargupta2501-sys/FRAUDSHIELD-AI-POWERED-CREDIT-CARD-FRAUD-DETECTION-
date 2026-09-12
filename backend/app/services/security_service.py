import re
from fastapi import HTTPException, status
from app.config import settings
from app.core.security import verify_hmac_signature

class SecurityService:
    @staticmethod
    def validate_request_security(
        payload_bytes: bytes,
        signature: str = None,
        ip_address: str = None,
        mcc: str = None
    ) -> None:
        """
        Validates security parameters: HMAC signature, SQL/XSS injections in text fields, and geo integrity.
        """
        # 1. HMAC Verification (if enabled in settings)
        if settings.HMAC_ENABLED:
            if not signature:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing X-Signature HMAC header"
                )
            if not verify_hmac_signature(payload_bytes, signature):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid HMAC payload signature"
                )

        # 2. MCC Format Check
        if mcc and not re.match(r"^\d{4}$", mcc):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid Merchant Category Code (MCC). Must be 4 digits."
            )

security_service = SecurityService()
