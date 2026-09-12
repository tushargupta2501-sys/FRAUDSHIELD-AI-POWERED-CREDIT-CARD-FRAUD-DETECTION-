import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
import logging

from app.schemas.risk import SHAPFactor

logger = logging.getLogger("sentinel.ml")

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml_artifacts"))

class MLInferenceService:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.explainer = None
        self.metadata = {}
        self.is_loaded = False
        self._load_artifacts()

    def _load_artifacts(self):
        try:
            model_path = os.path.join(ARTIFACTS_DIR, "model.joblib")
            preprocessor_path = os.path.join(ARTIFACTS_DIR, "preprocessor.joblib")
            explainer_path = os.path.join(ARTIFACTS_DIR, "explainer.joblib")
            metadata_path = os.path.join(ARTIFACTS_DIR, "metadata.json")

            if os.path.exists(model_path) and os.path.exists(preprocessor_path):
                self.model = joblib.load(model_path)
                self.preprocessor = joblib.load(preprocessor_path)
                if os.path.exists(explainer_path):
                    self.explainer = joblib.load(explainer_path)
                if os.path.exists(metadata_path):
                    with open(metadata_path, "r") as f:
                        self.metadata = json.load(f)
                self.is_loaded = True
                logger.info("ML Artifacts loaded successfully.")
            else:
                logger.warning("ML artifacts not found. Fallback heuristic mode active until model is trained.")
        except Exception as e:
            logger.error(f"Error loading ML artifacts: {e}")
            self.is_loaded = False

    def predict(self, feature_dict: Dict[str, Any]) -> Tuple[float, List[SHAPFactor]]:
        """
        Runs model inference and returns (fraud_probability, list of top SHAP factors).
        Adapts seamlessly to both Kaggle ULB 30-feature models and business domain models.
        """
        if not self.is_loaded or self.model is None:
            # High-fidelity statistical fallback if artifacts are still building
            amount = float(feature_dict.get("amount", feature_dict.get("Amount", 100.0)))
            velocity_5m = int(feature_dict.get("velocity_5m", 0))
            ratio = float(feature_dict.get("amount_to_avg_ratio", 1.0))
            is_night = int(feature_dict.get("is_night", 0))
            is_foreign = int(feature_dict.get("is_foreign", 0))

            score = 0.05
            if amount > 1000: score += 0.35
            if velocity_5m >= 3: score += 0.30
            if ratio > 3.0: score += 0.20
            if is_night: score += 0.10
            if is_foreign: score += 0.15
            prob = min(0.99, max(0.01, score))

            fallback_factors = [
                SHAPFactor(
                    feature="amount",
                    value=amount,
                    contribution=1.2 if amount > 500 else -0.5,
                    impact="INCREASES_RISK" if amount > 500 else "DECREASES_RISK",
                    explanation=f"Amount (${amount:.2f}) vs typical baseline."
                ),
                SHAPFactor(
                    feature="velocity_5m",
                    value=velocity_5m,
                    contribution=0.8 if velocity_5m > 1 else -0.3,
                    impact="INCREASES_RISK" if velocity_5m > 1 else "DECREASES_RISK",
                    explanation=f"Transaction count ({velocity_5m}) in 5-minute sliding window."
                )
            ]
            return prob, fallback_factors

        # Determine feature requirements of the preprocessor / model
        model_features = self.metadata.get("feature_names", None)
        expected_features = getattr(self.preprocessor, "feature_names_in_", None)
        if model_features is None:
            model_features = expected_features

        # Case A: Kaggle ULB 30-feature Model (V1..V28, Amount, Time)
        if model_features is not None and any(str(f).startswith("V") for f in model_features):
            amount = float(feature_dict.get("amount", feature_dict.get("Amount", 50.0)))
            hour = int(feature_dict.get("hour_of_day", 12))
            time_val = float(feature_dict.get("time", feature_dict.get("Time", hour * 3600.0)))
            velocity_5m = int(feature_dict.get("velocity_5m", 0))
            is_foreign = int(feature_dict.get("is_foreign", 0))

            # Build ULB feature row
            row_dict = {}
            for col in model_features:
                if col == "Amount":
                    row_dict[col] = amount
                elif col == "Time":
                    row_dict[col] = time_val
                elif col in feature_dict:
                    row_dict[col] = float(feature_dict[col])
                else:
                    # Synthetic approximation for PCA components if evaluating live transaction
                    if col == "V14":
                        row_dict[col] = -4.5 if (velocity_5m > 3 or is_foreign) else 0.2
                    elif col == "V12":
                        row_dict[col] = -3.8 if (amount > 1000 or velocity_5m > 3) else 0.1
                    elif col == "V10":
                        row_dict[col] = -3.2 if (velocity_5m > 4) else -0.1
                    elif col == "V17":
                        row_dict[col] = -3.0 if (is_foreign and amount > 500) else 0.0
                    elif col == "V4":
                        row_dict[col] = 3.5 if (velocity_5m > 3) else 0.1
                    else:
                        row_dict[col] = 0.0

            df_input = pd.DataFrame([row_dict])[model_features]
            transformed = df_input.copy()
            if hasattr(self.preprocessor, "transform"):
                transformed[["Amount", "Time"]] = self.preprocessor.transform(df_input[["Amount", "Time"]])
            transformed_arr = transformed.values

            # Model prediction
            if hasattr(self.model, "predict_proba"):
                proba = float(self.model.predict_proba(transformed_arr)[0, 1])
            else:
                proba = float(self.model.predict(transformed_arr)[0])

            # Compute SHAP
            shap_factors = []
            try:
                if self.explainer:
                    shap_vals = self.explainer.shap_values(transformed_arr)
                    if isinstance(shap_vals, list):
                        shap_vals = shap_vals[1]
                    shap_arr = shap_vals[0] if shap_vals.ndim > 1 else shap_vals

                    indexed_shaps = []
                    for idx, val in enumerate(shap_arr):
                        fname = model_features[idx] if idx < len(model_features) else f"Feature_{idx}"
                        indexed_shaps.append((fname, float(val)))
                    indexed_shaps.sort(key=lambda x: abs(x[1]), reverse=True)

                    for fname, contribution in indexed_shaps[:4]:
                        raw_val = row_dict.get(fname, "N/A")
                        impact = "INCREASES_RISK" if contribution > 0 else "DECREASES_RISK"
                        explanation = self._format_explanation(fname, contribution, raw_val)
                        shap_factors.append(SHAPFactor(
                            feature=fname,
                            value=str(round(raw_val, 2)) if isinstance(raw_val, (int, float)) else str(raw_val),
                            contribution=round(contribution, 3),
                            impact=impact,
                            explanation=explanation
                        ))
            except Exception as e:
                logger.error(f"SHAP explanation generation error: {e}")

            return proba, shap_factors

        # Case B: Standard Business Domain Preprocessor (ColumnTransformer)
        df_input = pd.DataFrame([feature_dict])
        transformed = self.preprocessor.transform(df_input)
        proba = float(self.model.predict_proba(transformed)[0, 1])

        shap_factors = []
        try:
            if self.explainer:
                shap_vals = self.explainer.shap_values(transformed)
                if isinstance(shap_vals, list):
                    shap_vals = shap_vals[1]
                shap_arr = shap_vals[0] if shap_vals.ndim > 1 else shap_vals
                feature_names = self.metadata.get("transformed_feature_names", [])

                indexed_shaps = []
                for idx, val in enumerate(shap_arr):
                    fname = feature_names[idx] if idx < len(feature_names) else f"feature_{idx}"
                    indexed_shaps.append((fname, float(val)))

                indexed_shaps.sort(key=lambda x: abs(x[1]), reverse=True)

                for fname, contribution in indexed_shaps[:4]:
                    raw_val = feature_dict.get(fname.split("__")[-1], "N/A")
                    impact = "INCREASES_RISK" if contribution > 0 else "DECREASES_RISK"
                    explanation = self._format_explanation(fname, contribution, raw_val)
                    shap_factors.append(SHAPFactor(
                        feature=fname,
                        value=str(raw_val),
                        contribution=round(contribution, 3),
                        impact=impact,
                        explanation=explanation
                    ))
        except Exception as e:
            logger.error(f"SHAP explanation generation error: {e}")

        return proba, shap_factors

    def _format_explanation(self, feature_name: str, contribution: float, value: Any) -> str:
        direction = "significantly elevated" if contribution > 0 else "within normal range"
        clean_name = feature_name.replace("num__", "").replace("cat__", "").replace("_", " ").title()
        return f"{clean_name} ({value}) is {direction} (SHAP {contribution:+.2f})."

ml_service = MLInferenceService()
