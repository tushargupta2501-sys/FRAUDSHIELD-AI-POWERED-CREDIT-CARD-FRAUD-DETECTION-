from typing import List, Dict, Any, Tuple
from datetime import datetime
from app.schemas.risk import RuleViolation
import logging

logger = logging.getLogger("sentinel.rules")

class RuleEngine:
    def __init__(self):
        # Default Active Rules
        self.rules = [
            {
                "rule_id": "RULE_VELOCITY_5M",
                "name": "High Velocity (5m)",
                "condition_type": "VELOCITY",
                "threshold": 3,
                "severity": "HIGH",
                "points": 35.0,
                "is_active": True,
                "description": "More than 3 transactions in 5 minutes"
            },
            {
                "rule_id": "RULE_HIGH_AMOUNT_SPIKE",
                "name": "Extreme Amount Spike",
                "condition_type": "AMOUNT_SPIKE",
                "threshold": 5.0,  # 5x 30-day baseline
                "severity": "HIGH",
                "points": 30.0,
                "is_active": True,
                "description": "Transaction amount is 5x higher than 30-day average"
            },
            {
                "rule_id": "RULE_SANCTIONED_COUNTRY",
                "name": "Sanctioned / High Risk Geo",
                "condition_type": "GEO_SANCTION",
                "forbidden_countries": ["RU", "KP", "IR", "SY", "NG", "UA"],
                "severity": "CRITICAL",
                "points": 45.0,
                "is_active": True,
                "description": "Transaction origin in high-risk/sanctioned territory"
            },
            {
                "rule_id": "RULE_HIGH_RISK_MCC_NIGHT",
                "name": "High Risk MCC During Night Hours",
                "condition_type": "MCC_NIGHT",
                "high_risk_mccs": ["6051", "7995", "5732", "5944"],
                "night_hours": [0, 1, 2, 3, 4, 5],
                "severity": "MEDIUM",
                "points": 25.0,
                "is_active": True,
                "description": "High-risk category (Crypto/Gambling/Electronics) between 12 AM - 5 AM"
            },
            {
                "rule_id": "RULE_ABSOLUTE_AMOUNT_CAP",
                "name": "Absolute High Amount Cap",
                "condition_type": "ABSOLUTE_AMOUNT",
                "threshold": 3000.0,
                "severity": "MEDIUM",
                "points": 20.0,
                "is_active": True,
                "description": "Single transaction exceeds $3,000 threshold"
            }
        ]

    def evaluate_rules(
        self,
        amount: float,
        mcc: str,
        country: str,
        hour_of_day: int,
        velocity_5m: int,
        user_30d_avg: float
    ) -> Tuple[float, List[RuleViolation]]:
        """
        Evaluates all active rules against the transaction context.
        Returns total_rule_points and a list of triggered RuleViolations.
        """
        triggered_violations: List[RuleViolation] = []
        total_points = 0.0

        for rule in self.rules:
            if not rule.get("is_active", True):
                continue

            c_type = rule["condition_type"]
            is_triggered = False
            details = rule["description"]

            if c_type == "VELOCITY":
                if velocity_5m >= rule["threshold"]:
                    is_triggered = True
                    details = f"Transaction velocity ({velocity_5m}) exceeds limit ({rule['threshold']}) in 5m window."

            elif c_type == "AMOUNT_SPIKE":
                if user_30d_avg > 0 and (amount / user_30d_avg) >= rule["threshold"]:
                    is_triggered = True
                    ratio = amount / user_30d_avg
                    details = f"Amount ${amount:.2f} is {ratio:.1f}x the user 30-day baseline (${user_30d_avg:.2f})."

            elif c_type == "GEO_SANCTION":
                if country.upper() in rule["forbidden_countries"]:
                    is_triggered = True
                    details = f"Transaction originates from flagged high-risk country code '{country.upper()}'."

            elif c_type == "MCC_NIGHT":
                if mcc in rule["high_risk_mccs"] and hour_of_day in rule["night_hours"]:
                    is_triggered = True
                    details = f"MCC {mcc} triggered during off-peak night hour ({hour_of_day}:00)."

            elif c_type == "ABSOLUTE_AMOUNT":
                if amount >= rule["threshold"]:
                    is_triggered = True
                    details = f"Single transaction amount (${amount:.2f}) exceeds threshold (${rule['threshold']:.2f})."

            if is_triggered:
                points = float(rule.get("points", 20.0))
                total_points += points
                triggered_violations.append(
                    RuleViolation(
                        rule_id=rule["rule_id"],
                        rule_name=rule["name"],
                        severity=rule["severity"],
                        description=details,
                        points_added=points
                    )
                )

        return min(100.0, total_points), triggered_violations

rule_engine = RuleEngine()
