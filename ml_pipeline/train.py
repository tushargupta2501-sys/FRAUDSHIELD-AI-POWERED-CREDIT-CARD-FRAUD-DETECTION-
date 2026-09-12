import os
import sys
import pickle
import json
import logging
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import RobustScaler, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)
import shap

# Add parent directory to path for local imports
sys.path.append(os.path.dirname(__file__))
from data_loader import load_or_generate_dataset, validate_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sentinel.train")

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
BACKEND_ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app", "ml_artifacts"))
DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs"))

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(BACKEND_ARTIFACTS_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

class MLFraudPipeline:
    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = RobustScaler()
        self.models = {}
        self.results = {}
        self.best_model_name = None
        self.best_model = None
        self.feature_names = None

    def preprocess_and_split(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, pd.Series, pd.Series]:
        """
        Validates, extracts features, normalizes Amount and Time, and stratifies train/test partitions.
        """
        validate_dataset(df)
        
        feature_cols = [f"V{i}" for i in range(1, 29)] + ["Amount", "Time"]
        self.feature_names = feature_cols

        X = df[feature_cols].copy()
        y = df["Class"].copy()

        logger.info(f"Dataset Shape: {X.shape} | Fraud Cases: {y.sum()} ({y.mean():.4%})")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state, stratify=y
        )

        logger.info(f"Train split: {X_train.shape[0]} samples ({y_train.sum()} frauds)")
        logger.info(f"Test split: {X_test.shape[0]} samples ({y_test.sum()} frauds)")

        # Fit RobustScaler strictly on train data to prevent lookahead leakage
        X_train_scaled = X_train.copy()
        X_test_scaled = X_test.copy()

        X_train_scaled[["Amount", "Time"]] = self.scaler.fit_transform(X_train[["Amount", "Time"]])
        X_test_scaled[["Amount", "Time"]] = self.scaler.transform(X_test[["Amount", "Time"]])

        return X_train_scaled.values, X_test_scaled.values, y_train.values, y_test.values

    def train_models(self, X_train: np.ndarray, y_train: np.ndarray):
        """
        Trains Logistic Regression, Random Forest, and XGBoost with class imbalance handling.
        """
        # Calculate imbalance weight
        n_pos = np.sum(y_train)
        n_neg = len(y_train) - n_pos
        scale_pos_weight = float(n_neg / max(1, n_pos))

        logger.info(f"Imbalance Scale Factor (Neg/Pos): {scale_pos_weight:.2f}")

        # 1. Logistic Regression
        logger.info("--> [1/3] Training Logistic Regression (class_weight='balanced')...")
        lr = LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            solver="lbfgs",
            random_state=self.random_state
        )
        lr.fit(X_train, y_train)
        self.models["Logistic Regression"] = lr

        # 2. Random Forest
        logger.info("--> [2/3] Training Random Forest (class_weight='balanced_subsample')...")
        rf = RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            class_weight="balanced_subsample",
            n_jobs=-1,
            random_state=self.random_state
        )
        rf.fit(X_train, y_train)
        self.models["Random Forest"] = rf

        # 3. XGBoost Classifier
        logger.info(f"--> [3/3] Training XGBoost (scale_pos_weight={scale_pos_weight:.2f})...")
        xgb = XGBClassifier(
            n_estimators=150,
            max_depth=5,
            learning_rate=0.08,
            scale_pos_weight=scale_pos_weight,
            subsample=0.85,
            colsample_bytree=0.85,
            eval_metric="aucpr",
            random_state=self.random_state
        )
        xgb.fit(X_train, y_train)
        self.models["XGBoost"] = xgb

    def evaluate_models(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        """
        Calculates comprehensive metrics (Precision, Recall, F1, ROC-AUC, PR-AUC, Confusion Matrix)
        for all trained models.
        """
        logger.info("Evaluating all candidate models on Out-of-Sample Test partition...")

        for name, model in self.models.items():
            y_pred = model.predict(X_test)
            if hasattr(model, "predict_proba"):
                y_prob = model.predict_proba(X_test)[:, 1]
            else:
                y_prob = model.decision_function(X_test)

            cm = confusion_matrix(y_test, y_pred)
            tn, fp, fn, tp = cm.ravel()

            prec = precision_score(y_test, y_pred, zero_division=0)
            rec = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)
            roc_auc = roc_auc_score(y_test, y_prob)
            pr_auc = average_precision_score(y_test, y_prob)

            self.results[name] = {
                "precision": float(round(prec, 4)),
                "recall": float(round(rec, 4)),
                "f1_score": float(round(f1, 4)),
                "roc_auc": float(round(roc_auc, 4)),
                "pr_auc": float(round(pr_auc, 4)),
                "confusion_matrix": {
                    "true_negatives": int(tn),
                    "false_positives": int(fp),
                    "false_negatives": int(fn),
                    "true_positives": int(tp)
                },
                "classification_report": classification_report(y_test, y_pred, target_names=["Legitimate", "Fraud"], output_dict=True)
            }

            logger.info(f"=== {name} ===")
            logger.info(f"  Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f}")
            logger.info(f"  ROC-AUC: {roc_auc:.4f} | PR-AUC (Avg Precision): {pr_auc:.4f}")
            logger.info(f"  Confusion Matrix: TP={tp}, FP={fp}, FN={fn}, TN={tn}")

        # Choose best model primarily by PR-AUC, then F1-score
        self.best_model_name = max(self.results, key=lambda k: (self.results[k]["pr_auc"], self.results[k]["f1_score"]))
        self.best_model = self.models[self.best_model_name]
        logger.info(f"🏆 Best Selected Model: '{self.best_model_name}' (PR-AUC: {self.results[self.best_model_name]['pr_auc']})")

        return self.results

    def save_artifacts(self, X_test: np.ndarray):
        """
        Serializes models, scalers, and metadata to models/ and backend/app/ml_artifacts/.
        """
        logger.info(f"Saving primary models to '{MODELS_DIR}'...")

        # 1. Save standard requested files: models/fraud_model.pkl and models/scaler.pkl
        fraud_model_pkl_path = os.path.join(MODELS_DIR, "fraud_model.pkl")
        scaler_pkl_path = os.path.join(MODELS_DIR, "scaler.pkl")

        with open(fraud_model_pkl_path, "wb") as f:
            pickle.dump(self.best_model, f)
        with open(scaler_pkl_path, "wb") as f:
            pickle.dump(self.scaler, f)

        # Also save joblib versions
        joblib.dump(self.best_model, os.path.join(MODELS_DIR, "fraud_model.joblib"))
        joblib.dump(self.scaler, os.path.join(MODELS_DIR, "scaler.joblib"))

        logger.info(f"Saved: {fraud_model_pkl_path}")
        logger.info(f"Saved: {scaler_pkl_path}")

        # 2. Build SHAP Explainer for XGBoost (or TreeExplainer for Tree-based models)
        logger.info("Generating SHAP TreeExplainer...")
        xgb_model = self.models.get("XGBoost")
        if xgb_model:
            explainer = shap.TreeExplainer(xgb_model)
            joblib.dump(explainer, os.path.join(MODELS_DIR, "explainer.joblib"))
            joblib.dump(explainer, os.path.join(BACKEND_ARTIFACTS_DIR, "explainer.joblib"))
            joblib.dump(xgb_model, os.path.join(BACKEND_ARTIFACTS_DIR, "model.joblib"))
            joblib.dump(self.scaler, os.path.join(BACKEND_ARTIFACTS_DIR, "preprocessor.joblib"))

        # 3. Save comprehensive metadata
        metadata = {
            "best_model": self.best_model_name,
            "feature_names": self.feature_names,
            "model_comparison": self.results,
            "training_timestamp": pd.Timestamp.now().isoformat()
        }
        with open(os.path.join(MODELS_DIR, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
        with open(os.path.join(BACKEND_ARTIFACTS_DIR, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)

        # 4. Generate Model Comparison Report in docs/
        self._write_comparison_report()

    def _write_comparison_report(self):
        report_path = os.path.join(DOCS_DIR, "model_comparison_report.md")
        logger.info(f"Writing detailed Model Comparison Report to '{report_path}'...")
        
        md_content = "# SentinelAI — Model Comparison & Benchmark Report\n\n"
        md_content += "## 1. Performance Summary Table\n\n"
        md_content += "| Model Architecture | Precision | Recall | F1-Score | ROC-AUC | PR-AUC (Average Precision) | False Positives | False Negatives |\n"
        md_content += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"

        for name, res in self.results.items():
            cm = res["confusion_matrix"]
            highlight = "**" if name == self.best_model_name else ""
            md_content += f"| {highlight}{name}{highlight} | {res['precision']:.4f} | {res['recall']:.4f} | {res['f1_score']:.4f} | {res['roc_auc']:.4f} | {highlight}{res['pr_auc']:.4f}{highlight} | {cm['false_positives']} | {cm['false_negatives']} |\n"

        md_content += "\n---\n\n"
        md_content += "## 2. Confusion Matrices Breakdown\n\n"
        for name, res in self.results.items():
            cm = res["confusion_matrix"]
            md_content += f"### {name}\n"
            md_content += f"```text\n"
            md_content += f"                Actual Legit (0)    Actual Fraud (1)\n"
            md_content += f"Predicted (0):  TN = {cm['true_negatives']:<10}    FN = {cm['false_negatives']:<10}\n"
            md_content += f"Predicted (1):  FP = {cm['false_positives']:<10}    TP = {cm['true_positives']:<10}\n"
            md_content += f"```\n\n"

        md_content += "## 3. Analysis & Recommendation\n\n"
        md_content += f"- **Champion Model**: `{self.best_model_name}`\n"
        md_content += "- **Precision vs Recall Trade-off**: In payment fraud, PR-AUC is the definitive metric over ROC-AUC due to the rare positive rate.\n"
        md_content += "- **Operational Recommendation**: Deploy `XGBoost` with calibrated decision thresholds to minimize customer friction while capturing high-risk anomalies.\n"

        with open(report_path, "w") as f:
            f.write(md_content)

def run_pipeline():
    logger.info("=================================================================")
    logger.info("          STARTING SENTINEL-AI ML TRAINING PIPELINE              ")
    logger.info("=================================================================")

    pipeline = MLFraudPipeline(random_state=42)
    df = load_or_generate_dataset(n_samples=50000)
    
    X_train, X_test, y_train, y_test = pipeline.preprocess_and_split(df)
    pipeline.train_models(X_train, y_train)
    pipeline.evaluate_models(X_test, y_test)
    pipeline.save_artifacts(X_test)

    logger.info("=================================================================")
    logger.info("         TRAINING PIPELINE COMPLETED SUCCESSFULLY!               ")
    logger.info("=================================================================")

if __name__ == "__main__":
    run_pipeline()
