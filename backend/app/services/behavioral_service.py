from typing import Dict, Any, Tuple
import math
import time
from collections import defaultdict
import logging

logger = logging.getLogger("sentinel.behavioral")

class BehavioralEngine:
    """
    Tracks and maintains user spending profiles, historical baselines, and computes Z-score anomaly indices.
    """
    def __init__(self):
        # In-memory user profiles cache
        self.profiles: Dict[str, Dict[str, Any]] = {
            "usr_demo": {
                "avg_amount_30d": 85.0,
                "std_amount_30d": 30.0,
                "max_amount_30d": 350.0,
                "total_txns_30d": 42,
                "frequent_mccs": ["5411", "5812", "5814"],
                "frequent_countries": ["US"]
            }
        }
        # In-memory sliding velocity tracker: user_id -> [timestamps]
        self.velocity_tracker: Dict[str, list] = defaultdict(list)

    def get_or_create_profile(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self.profiles:
            self.profiles[user_id] = {
                "avg_amount_30d": 110.0,
                "std_amount_30d": 45.0,
                "max_amount_30d": 450.0,
                "total_txns_30d": 15,
                "frequent_mccs": ["5411", "5812"],
                "frequent_countries": ["US"]
            }
        return self.profiles[user_id]

    def record_and_get_velocity(self, user_id: str) -> Tuple[int, int, int]:
        """
        Records current transaction timestamp and returns (count_5m, count_1h, count_24h).
        """
        now = time.time()
        self.velocity_tracker[user_id].append(now)
        
        # Prune older than 24h
        cutoff_24h = now - 86400
        self.velocity_tracker[user_id] = [t for t in self.velocity_tracker[user_id] if t > cutoff_24h]

        timestamps = self.velocity_tracker[user_id]
        cutoff_5m = now - 300
        cutoff_1h = now - 3600

        v_5m = sum(1 for t in timestamps if t > cutoff_5m)
        v_1h = sum(1 for t in timestamps if t > cutoff_1h)
        v_24h = len(timestamps)

        return v_5m, v_1h, v_24h

    def compute_anomaly_z_score(self, amount: float, user_id: str) -> Tuple[float, float]:
        """
        Computes the Z-Score: (amount - avg) / std.
        Returns (z_score, user_30d_avg).
        """
        profile = self.get_or_create_profile(user_id)
        avg = profile["avg_amount_30d"]
        std = max(10.0, profile["std_amount_30d"])

        z_score = (amount - avg) / std
        return round(z_score, 2), avg

behavioral_engine = BehavioralEngine()
