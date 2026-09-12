import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger("sentinel.middleware")

class RateLimiter:
    """Sliding-window IP rate limiter."""
    def __init__(self, limit_per_minute: int = 120):
        self.limit = limit_per_minute
        self.requests = defaultdict(list)

    def is_allowed(self, ip_address: str) -> bool:
        now = time.time()
        window_start = now - 60.0
        
        # Clean expired timestamps
        self.requests[ip_address] = [t for t in self.requests[ip_address] if t > window_start]
        
        if len(self.requests[ip_address]) >= self.limit:
            return False
            
        self.requests[ip_address].append(now)
        return True

rate_limiter = RateLimiter(limit_per_minute=180)

class SecurityAndTimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Extract Client IP
        client_ip = request.client.host if request.client else "127.0.0.1"
        if request.headers.get("X-Forwarded-For"):
            client_ip = request.headers.get("X-Forwarded-For").split(",")[0].strip()

        # Rate Limit check on evaluate endpoints
        if request.url.path.endswith("/evaluate") and request.method == "POST":
            if not rate_limiter.is_allowed(client_ip):
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Too many transaction evaluation requests."
                )

        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000.0
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        return response
