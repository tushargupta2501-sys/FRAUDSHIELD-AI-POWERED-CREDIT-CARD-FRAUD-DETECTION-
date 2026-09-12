import numpy as np
import pandas as pd
import random
from datetime import datetime, timedelta

def generate_synthetic_fraud_dataset(n_samples: int = 15000, fraud_ratio: float = 0.05, seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic credit card transactions dataset with embedded fraud patterns.
    """
    np.random.seed(seed)
    random.seed(seed)

    n_fraud = int(n_samples * fraud_ratio)
    n_legit = n_samples - n_fraud

    # Normal Transactions
    legit_users = [f"usr_{np.random.randint(1000, 9999)}" for _ in range(500)]
    legit_mccs = ["5411", "5812", "5814", "5311", "5912", "4121", "5541", "5732"]
    legit_countries = ["US"] * 95 + ["CA", "GB", "DE", "FR", "JP"]

    legit_data = []
    base_time = datetime(2026, 9, 1, 0, 0, 0)

    for i in range(n_legit):
        user_id = random.choice(legit_users)
        amount = round(float(np.random.lognormal(mean=3.8, sigma=0.9)), 2)  # Typically $20 - $250
        amount = max(2.50, min(amount, 2500.0))
        
        # Hours: mostly 07:00 to 22:00
        hour = int(np.clip(np.random.normal(loc=14, scale=4), 0, 23))
        timestamp = base_time + timedelta(days=random.randint(0, 10), hours=hour, minutes=random.randint(0, 59))
        
        mcc = random.choice(legit_mccs)
        country = random.choice(legit_countries)
        velocity_5m = np.random.poisson(lam=0.2)
        velocity_1h = np.random.poisson(lam=0.8) + velocity_5m
        velocity_24h = np.random.poisson(lam=2.5) + velocity_1h
        user_30d_avg = round(float(np.random.uniform(50.0, 150.0)), 2)
        amount_to_avg_ratio = round(amount / user_30d_avg, 2)
        
        legit_data.append({
            "amount": amount,
            "hour_of_day": hour,
            "mcc": mcc,
            "country": country,
            "velocity_5m": velocity_5m,
            "velocity_1h": velocity_1h,
            "velocity_24h": velocity_24h,
            "user_30d_avg": user_30d_avg,
            "amount_to_avg_ratio": amount_to_avg_ratio,
            "is_foreign": 1 if country != "US" else 0,
            "is_night": 1 if hour in [0, 1, 2, 3, 4, 5] else 0,
            "is_high_risk_mcc": 1 if mcc in ["6051", "7995", "5732"] else 0,
            "is_fraud": 0
        })

    # Fraudulent Transactions (Patterns: High amount + Night + High Velocity + Anomaly Ratio + High-risk MCC)
    fraud_mccs = ["6051", "7995", "5732", "5944", "4829"]
    fraud_countries = ["RU", "NG", "UA", "RO", "CN", "US", "CY"]

    fraud_data = []
    for i in range(n_fraud):
        pattern_type = random.choice(["velocity_spike", "high_value_night", "card_testing", "overseas_anomaly"])
        user_30d_avg = round(float(np.random.uniform(40.0, 100.0)), 2)

        if pattern_type == "velocity_spike":
            amount = round(float(np.random.uniform(150.0, 950.0)), 2)
            hour = random.randint(0, 23)
            velocity_5m = random.randint(4, 10)
            velocity_1h = random.randint(8, 25)
            velocity_24h = random.randint(15, 40)
            mcc = random.choice(fraud_mccs)
            country = random.choice(["US", "GB", "RO"])

        elif pattern_type == "high_value_night":
            amount = round(float(np.random.uniform(1800.0, 9500.0)), 2)
            hour = random.choice([0, 1, 2, 3, 4, 5])
            velocity_5m = random.randint(1, 3)
            velocity_1h = random.randint(2, 6)
            velocity_24h = random.randint(4, 10)
            mcc = random.choice(["5732", "5944", "6051"])
            country = random.choice(fraud_countries)

        elif pattern_type == "card_testing":
            # Very low amount test, followed by rapid attempts
            amount = round(float(np.random.uniform(0.50, 3.50)), 2)
            hour = random.randint(0, 23)
            velocity_5m = random.randint(5, 15)
            velocity_1h = random.randint(10, 30)
            velocity_24h = random.randint(15, 50)
            mcc = "5311"
            country = random.choice(["US", "NG", "UA"])

        else:  # overseas_anomaly
            amount = round(float(np.random.uniform(600.0, 3500.0)), 2)
            hour = random.randint(0, 23)
            velocity_5m = random.randint(1, 4)
            velocity_1h = random.randint(2, 8)
            velocity_24h = random.randint(5, 12)
            mcc = random.choice(fraud_mccs)
            country = random.choice(["RU", "NG", "CN", "CY"])

        amount_to_avg_ratio = round(amount / user_30d_avg, 2)

        fraud_data.append({
            "amount": amount,
            "hour_of_day": hour,
            "mcc": mcc,
            "country": country,
            "velocity_5m": velocity_5m,
            "velocity_1h": velocity_1h,
            "velocity_24h": velocity_24h,
            "user_30d_avg": user_30d_avg,
            "amount_to_avg_ratio": amount_to_avg_ratio,
            "is_foreign": 1 if country != "US" else 0,
            "is_night": 1 if hour in [0, 1, 2, 3, 4, 5] else 0,
            "is_high_risk_mcc": 1 if mcc in ["6051", "7995", "5732", "5944", "4829"] else 0,
            "is_fraud": 1
        })

    all_data = legit_data + fraud_data
    random.shuffle(all_data)
    df = pd.DataFrame(all_data)
    return df

if __name__ == "__main__":
    df = generate_synthetic_fraud_dataset(n_samples=20000, fraud_ratio=0.06)
    df.to_csv("synthetic_fraud_transactions.csv", index=False)
    print(f"Dataset generated: {len(df)} records. Fraud count: {df['is_fraud'].sum()} ({df['is_fraud'].mean():.2%})")
