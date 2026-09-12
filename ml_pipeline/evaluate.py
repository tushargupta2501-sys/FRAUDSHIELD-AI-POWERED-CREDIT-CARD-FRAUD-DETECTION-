import os
import sys
import pickle
import joblib
import numpy as np
import pandas as pd
import logging
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)

sys.path.append(os.path.dirname(__file__))
from data_loader import load_or_generate_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sentinel.evaluate")

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))

def evaluate_model_pipeline(
    model_path: str = os.path.join(MODELS_DIR, "fraud_model.pkl"),
    scaler_path: str = os.path.join(MODELS_DIR, "scaler.pkl"),
    dataset_path: str = None
):
    """
    Independent offline evaluation script for SentinelAI fraud models.
    """
    if not os.path.exists(model_path):
        # Fallback to joblib if pkl not found
        model_path = os.path.join(MODELS_DIR, "fraud_model.joblib")
    if not os.path.exists(scaler_path):
        scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Model or scaler not found in '{MODELS_DIR}'. Please run train.py first.")

    logger.info(f"Loading model from: {model_path}")
    logger.info(f"Loading scaler from: {scaler_path}")

    with open(model_path, "rb") as f:
        model = pickle.load(f)
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)

    logger.info("Loading evaluation dataset...")
    df = load_or_generate_dataset(n_samples=25000)

    feature_cols = [f"V{i}" for i in range(1, 29)] + ["Amount", "Time"]
    X = df[feature_cols].copy()
    y = df["Class"].values

    # Scale using loaded scaler
    X[["Amount", "Time"]] = scaler.transform(X[["Amount", "Time"]])

    logger.info("Running model predictions...")
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X.values)[:, 1]
    else:
        y_prob = model.decision_function(X.values)

    y_pred = (y_prob >= 0.50).astype(int)

    # Compute Core Metrics
    prec = precision_score(y, y_pred, zero_division=0)
    rec = recall_score(y, y_pred, zero_division=0)
    f1 = f1_score(y, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y, y_prob)
    pr_auc = average_precision_score(y, y_prob)
    cm = confusion_matrix(y, y_pred)
    tn, fp, fn, tp = cm.ravel()

    print("\n" + "="*65)
    print(f"      SENTINEL-AI MODEL EVALUATION & DIAGNOSTICS REPORT        ")
    print("="*65)
    print(f"Total Transactions Evaluated : {len(y):,}")
    print(f"Ground Truth Frauds          : {np.sum(y):,} ({np.mean(y):.4%})")
    print(f"Model Architecture           : {type(model).__name__}")
    print("-"*65)
    print(f"  Precision                  : {prec:.4%}")
    print(f"  Recall (Sensitivity)       : {rec:.4%}")
    print(f"  F1-Score                   : {f1:.4f}")
    print(f"  ROC-AUC Score              : {roc_auc:.4f}")
    print(f"  PR-AUC (Average Precision) : {pr_auc:.4f}")
    print("-"*65)
    print("Confusion Matrix (Decision Threshold = 0.50):")
    print(f"  [TN: {tn:<7}  |  FP: {fp:<7}]")
    print(f"  [FN: {fn:<7}  |  TP: {tp:<7}]")
    print("-"*65)
    print("\nClassification Report:")
    print(classification_report(y, y_pred, target_names=["Legitimate", "Fraud"]))
    print("-"*65)

    # Threshold Sweep Simulation
    print("Decision Threshold Sweep (Cost & Operational Trade-offs):")
    print(f"{'Threshold':<12} | {'Precision':<12} | {'Recall':<12} | {'F1-Score':<12} | {'FPs':<8} | {'FNs':<8}")
    print("-"*72)
    for thresh in [0.10, 0.25, 0.50, 0.70, 0.85, 0.95]:
        t_pred = (y_prob >= thresh).astype(int)
        t_prec = precision_score(y, t_pred, zero_division=0)
        t_rec = recall_score(y, t_pred, zero_division=0)
        t_f1 = f1_score(y, t_pred, zero_division=0)
        t_cm = confusion_matrix(y, t_pred)
        t_tn, t_fp, t_fn, t_tp = t_cm.ravel()
        print(f"{thresh:<12.2f} | {t_prec:<12.4f} | {t_rec:<12.4f} | {t_f1:<12.4f} | {t_fp:<8} | {t_fn:<8}")
    print("="*65 + "\n")

if __name__ == "__main__":
    evaluate_model_pipeline()
