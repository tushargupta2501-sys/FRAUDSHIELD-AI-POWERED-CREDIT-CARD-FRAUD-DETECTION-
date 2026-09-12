# SentinelAI — Model Comparison & Benchmark Report

## 1. Performance Summary Table

| Model Architecture | Precision | Recall | F1-Score | ROC-AUC | PR-AUC (Average Precision) | False Positives | False Negatives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Logistic Regression | 0.0609 | 0.9184 | 0.1142 | 0.9720 | 0.7175 | 1388 | 8 |
| Random Forest | 0.8404 | 0.8061 | 0.8229 | 0.9751 | 0.8253 | 15 | 19 |
| **XGBoost** | 0.6641 | 0.8673 | 0.7522 | 0.9832 | **0.8475** | 43 | 13 |

---

## 2. Confusion Matrices Breakdown

### Logistic Regression
```text
                Actual Legit (0)    Actual Fraud (1)
Predicted (0):  TN = 55476         FN = 8         
Predicted (1):  FP = 1388          TP = 90        
```

### Random Forest
```text
                Actual Legit (0)    Actual Fraud (1)
Predicted (0):  TN = 56849         FN = 19        
Predicted (1):  FP = 15            TP = 79        
```

### XGBoost
```text
                Actual Legit (0)    Actual Fraud (1)
Predicted (0):  TN = 56821         FN = 13        
Predicted (1):  FP = 43            TP = 85        
```

## 3. Analysis & Recommendation

- **Champion Model**: `XGBoost`
- **Precision vs Recall Trade-off**: In payment fraud, PR-AUC is the definitive metric over ROC-AUC due to the rare positive rate.
- **Operational Recommendation**: Deploy `XGBoost` with calibrated decision thresholds to minimize customer friction while capturing high-risk anomalies.
