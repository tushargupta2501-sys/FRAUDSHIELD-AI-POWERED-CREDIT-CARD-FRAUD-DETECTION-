import os
import pandas as pd
import numpy as np
import logging
from typing import Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sentinel.data_loader")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DEFAULT_CSV_PATH = os.path.join(DATA_DIR, "creditcard.csv")

def load_or_generate_dataset(csv_path: str = DEFAULT_CSV_PATH, n_samples: int = 50000, random_state: int = 42) -> pd.DataFrame:
    """
    Loads the Kaggle ULB creditcard.csv dataset if available,
    or generates a realistic benchmark dataset with Time, Amount, V1-V28, and Class.
    """
    if os.path.exists(csv_path):
        logger.info(f"Loading Kaggle ULB dataset from '{csv_path}'...")
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} transactions. Fraud cases: {df['Class'].sum()} ({df['Class'].mean():.4%})")
        return df
    
    # Check parent workspace directories for creditcard.csv
    parent_candidate = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "creditcard.csv"))
    if os.path.exists(parent_candidate):
        logger.info(f"Loading Kaggle ULB dataset from '{parent_candidate}'...")
        df = pd.read_csv(parent_candidate)
        return df

    logger.warning(f"Kaggle 'creditcard.csv' not found at '{csv_path}'. Generating synthetic ULB-structured dataset ({n_samples} samples)...")
    np.random.seed(random_state)
    
    n_fraud = int(n_samples * 0.00173)  # Standard 0.173% ULB ratio
    n_legit = n_samples - n_fraud

    # Normal Transactions
    time_legit = np.sort(np.random.uniform(0, 172800, n_legit))
    amount_legit = np.clip(np.random.lognormal(mean=3.6, sigma=1.2, size=n_legit), 0.5, 3000.0)
    v_legit = np.random.normal(loc=0.0, scale=1.0, size=(n_legit, 28))
    
    # Fraudulent Transactions (Distinct shifts on V14, V12, V10, V17, V4, V11 and extreme amounts)
    time_fraud = np.sort(np.random.uniform(0, 172800, n_fraud))
    # Fraud amounts often bimodal: either micro-probe ($1-$5) or high cash-out ($500-$2500)
    amount_fraud = np.where(
        np.random.rand(n_fraud) > 0.4,
        np.random.uniform(400, 2500, n_fraud),
        np.random.uniform(1.0, 15.0, n_fraud)
    )
    v_fraud = np.random.normal(loc=0.0, scale=1.2, size=(n_fraud, 28))
    v_fraud[:, 13] -= np.random.uniform(3.0, 7.0, n_fraud)  # V14 strong negative
    v_fraud[:, 11] -= np.random.uniform(2.5, 6.0, n_fraud)  # V12 strong negative
    v_fraud[:, 9]  -= np.random.uniform(2.0, 5.0, n_fraud)  # V10 strong negative
    v_fraud[:, 16] -= np.random.uniform(2.0, 5.5, n_fraud)  # V17 strong negative
    v_fraud[:, 3]  += np.random.uniform(2.0, 5.0, n_fraud)  # V4 positive shift
    v_fraud[:, 10] += np.random.uniform(2.0, 4.5, n_fraud)  # V11 positive shift
    v_fraud[:, 1]  += np.random.uniform(1.5, 4.0, n_fraud)  # V2 positive shift

    columns = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount", "Class"]
    
    legit_matrix = np.column_stack([time_legit, v_legit, amount_legit, np.zeros(n_legit)])
    fraud_matrix = np.column_stack([time_fraud, v_fraud, amount_fraud, np.ones(n_fraud)])
    
    all_data = np.vstack([legit_matrix, fraud_matrix])
    # Sort chronologically by Time
    all_data = all_data[all_data[:, 0].argsort()]
    
    df = pd.DataFrame(all_data, columns=columns)
    df["Class"] = df["Class"].astype(int)

    os.makedirs(DATA_DIR, exist_ok=True)
    df.to_csv(csv_path, index=False)
    logger.info(f"Synthetic ULB dataset saved to '{csv_path}'. Total rows: {len(df)}, Frauds: {df['Class'].sum()}")
    return df

def validate_dataset(df: pd.DataFrame) -> bool:
    """
    Validates dataset integrity, required columns, and absence of NaNs.
    """
    required = ["Time", "Amount", "Class"] + [f"V{i}" for i in range(1, 29)]
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise ValueError(f"Dataset validation failed: missing columns {missing}")
    
    null_counts = df[required].isnull().sum().sum()
    if null_counts > 0:
        logger.warning(f"Dataset contains {null_counts} null values. Dropping nulls...")
        df.dropna(subset=required, inplace=True)
    
    logger.info("Dataset validation passed successfully.")
    return True
