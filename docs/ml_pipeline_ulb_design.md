# SentinelAI — Machine Learning Pipeline Design (ULB Dataset)
## Phase 2: Offline ML Architecture, PCA Transformation Analysis, & Imbalance Engineering

---

## 1. Executive Summary & Objective

This document formalizes the Machine Learning pipeline design for **SentinelAI** using the benchmark **ULB (Université Libre de Bruxelles) Credit Card Fraud Detection Dataset**. 

The goal of Phase 2 is to design a resilient, high-throughput, explainable credit card fraud detection engine capable of operating under extreme class imbalance ($0.172\%$ positive fraud incidence) while maintaining sub-$20\text{ ms}$ single-instance inference latency and minimizing both financial loss (False Negatives) and legitimate customer friction (False Positives).

---

## 2. Dataset Structure & Characterization

| Property | Value | Description |
| :--- | :--- | :--- |
| **Total Transactions ($N$)** | $284,807$ | European cardholder transactions occurring over 2 days (September 2013). |
| **Fraudulent Transactions ($N_{\text{fraud}}$)** | $492$ | Positive target class (`Class = 1`). |
| **Legitimate Transactions ($N_{\text{legit}}$)** | $284,315$ | Negative class (`Class = 0`). |
| **Fraud Class Ratio ($\pi_{\text{fraud}}$)** | **$0.1727\%$** | Severe class imbalance ($\approx 1 : 578$). |
| **Total Features ($D$)** | $30$ | $28$ PCA principal components (`V1`–`V28`), `Time`, `Amount`. |
| **Target Variable** | `Class` | Binary label ($\{0, 1\}$). |
| **Missing Values** | $0$ | Dense numerical dataset. |

### Feature Breakdown
1. **`Time`** (Continuous): Elapsed seconds between the current transaction and the first transaction in the dataset ($\Delta t \in [0, 172792\text{ s}] \approx 48\text{ hours}$).
2. **`Amount`** (Continuous): Transaction amount in Euros ($\mu = 88.35$, $\sigma = 250.12$, $\min = 0.00$, $\max = 25,691.16$). Displays heavy right-skewness.
3. **`V1` to `V28`** (Continuous): Orthogonal principal components resulting from a Principal Component Analysis (PCA) transformation applied to original, confidential cardholder features.

---

## 3. Critical Limitations of the ULB Dataset

While the ULB dataset is the industry standard academic benchmark, practical deployment within an enterprise security gateway like SentinelAI highlights several critical limitations:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ULB Dataset Limitations                         │
├────────────────────────────┬───────────────────────────────────────────┤
│ 1. Anonymization Blindness │ Raw PII, MCC, IP & Merchant IDs removed   │
│ 2. Limited Time Horizon    │ Only 48 hours (no seasonal/monthly cycle) │
│ 3. Static Snapshot         │ No cardholder entity graph or history     │
│ 4. Delayed Feedback Omission│ Instant labels; ignores 30-90d chargebacks│
│ 5. Adversarial Drift Loss  │ Static attack vectors (2013 fraud patterns)│
└────────────────────────────┴───────────────────────────────────────────┘
```

1. **Entity Graph Absence**: Because cardholder IDs, device fingerprints, and merchant category codes (MCC) are redacted, entity-level graph features and multi-account velocity tracking cannot be directly extracted from raw ULB columns.
2. **Short Observation Horizon ($48\text{ Hours}$)**: The dataset spans only 2 days. Long-term trend analysis, weekend-vs-weekday seasonality, monthly salary cycles, and concept drift over time cannot be trained solely on ULB time steps.
3. **Absence of Chargeback Lag**: Real-world fraud detection systems face a 30 to 90-day label delay (chargeback settlement window). In ULB, labels are ground-truth instantaneous, which does not reflect production label latency.
4. **Zero Domain Categoricals**: All categorical dimensions (card brand, terminal type, 3DS verification status) are compressed into numeric PCA vectors.

---

## 4. Why V1–V28 Cannot Be Interpreted as Business Fields

To comply with European data protection regulations (GDPR / Belgian Privacy Commission) and PCI-DSS requirements, the original feature space $\mathbf{X} \in \mathbb{R}^{d}$ was transformed via linear orthogonal projection:

$$\mathbf{Z} = \mathbf{X} \mathbf{W}$$

where $\mathbf{W} \in \mathbb{R}^{d \times 28}$ is the matrix of eigenvectors corresponding to the top 28 eigenvalues of the sample covariance matrix $\mathbf{\Sigma}$.

### Mathematical & Domain Reasons:
1. **Linear Superposition of Mixed Entities**: Each component $V_j$ is a linear combination of original variables:
   $$V_j = w_{1j} \cdot \text{UserAge} + w_{2j} \cdot \text{MCC} + w_{3j} \cdot \text{GeoDist} + \dots + w_{dj} \cdot \text{DeviceScore}$$
   No individual $V_j$ corresponds to a discrete business field like "Merchant Name" or "CVV Match".
2. **Loss of Monotonicity & Units**: Real-world rules like "Flag if Amount > $5000" are monotone and human-interpretable. In PCA space, $V_j$ values can be negative or positive without standard business units (e.g., USD or Km).
3. **Impact on Model Explainability (SHAP/LIME)**:
   Computing SHAP values $\phi_i(V_j)$ indicates that principal component $V_j$ drove a prediction upward or downward, but business compliance officers and fraud investigators cannot tell a cardholder: *"Your transaction was blocked because $V_{14} < -4.2$."*
4. **SentinelAI Hybrid Solution**: SentinelAI resolves this by operating a dual-track architecture: the ML pipeline ingests PCA vectors (or synthetic representations) while the upstream Rule & Behavioral Engines compute human-auditable domain rules (Velocity, Geo-distance, MCC).

---

## 5. Exploratory Data Analysis (EDA) Plan

```
                        EDA Execution Pipeline
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
[Univariate & Skewness]   [Bivariate Class Split]     [Manifold & Dimensionality]
 - Amount log-distribution - Kernel Density Estimation - t-SNE / UMAP Projection
 - Time periodic cyclical   - Box plots of V1-V28       - Spearman Correlation
 - Outlier bounds (IQR)    - Point-biserial r          - PCA Explained Variance
```

### Key Analytical Steps:
1. **Target Distribution**: Verification of $N_{\text{fraud}} / N_{\text{total}} = 0.172\%$.
2. **Amount Distribution & Skewness**:
   * Inspect log-transformed distributions: $\tilde{A} = \log(1 + \text{Amount})$.
   * Median fraud amount vs median legit amount comparison (Fraud often exhibits bimodal peaks: micro-probing $\$1$–$\$5$ and maximum cashout $\$1,000+$).
3. **Temporal Periodicity**:
   * Decompose `Time` modulo 86,400 seconds ($24\text{ hours}$) to evaluate circadian transaction volume curves vs fraud incidence rate spikes during low-volume hours ($02:00$–$05:00$).
4. **Feature Correlation & Signal Separation**:
   * Calculate Pearson and Spearman correlation between $V_1 \dots V_{28}$ and `Class`.
   * Key features historically showing strong fraud separation: $V_{14}$, $V_{12}$, $V_{10}$, $V_{17}$ (negative correlation with fraud) and $V_4$, $V_{11}$, $V_2$ (positive correlation with fraud).
5. **Dimensionality & Cluster Visualization**:
   * Sample $10,000$ legitimate and all $492$ fraud records; run **t-SNE** / **UMAP** in 2D space to verify whether fraud instances form isolated dense manifolds or remain diffused in normal clusters.

---

## 6. Preprocessing & Feature Engineering Plan

```
[Raw Transaction Record]
   │
   ├──▶ Amount ──────▶ [RobustScaler (IQR Centering)] ─────────▶ Amount_scaled
   │
   ├──▶ Time ────────▶ [Cyclical Sine/Cosine Transform] ───────▶ Time_sin, Time_cos
   │
   ├──▶ Amount + PCA ─▶ [Interaction Features: Amount * V_k] ──▶ Interaction_terms
   │
   └──▶ V1 - V28 ─────▶ [Pass-through (Zero-mean preserved)] ──▶ V1...V28
```

### 1. Amount Normalization
* Standard `StandardScaler` is vulnerable to extreme transaction outliers ($\max = \$25,691.16$).
* **Strategy**: Use **`RobustScaler`** (based on median and Interquartile Range $IQR = Q_3 - Q_1$):
  $$x_{\text{scaled}} = \frac{x - \text{median}(x)}{IQR(x)}$$
  Alternatively, apply Power Transformation: $\log_{1p}(x) = \ln(1 + x)$.

### 2. Time Engineering (Circadian Cyclical Transformation)
* Raw seconds from start ($0 \dots 172792$) is non-cyclical.
* Map seconds to hour of day: $H = \lfloor \frac{\text{Time}}{3600} \rfloor \pmod{24}$.
* Convert into continuous 2D periodic signals:
  $$\text{Time}_{\sin} = \sin\left(\frac{2\pi \cdot H}{24}\right), \quad \text{Time}_{\cos} = \cos\left(\frac{2\pi \cdot H}{24}\right)$$

### 3. Non-Linear Feature Interactions
* Generate interaction products between highly predictive components and scaled amount:
  $$F_{\text{int\_1}} = \text{Amount}_{\text{scaled}} \times V_{14}, \quad F_{\text{int\_2}} = \text{Amount}_{\text{scaled}} \times V_{10}, \quad F_{\text{int\_3}} = V_{12} \times V_{17}$$

---

## 7. Train / Test Split & Validation Strategy

```
                          Data Partitioning Strategy
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
 [Option A: Temporal Holdout]                          [Option B: Stratified K-Fold]
  - Train: First 36 Hours                               - 5-Fold Stratified CV
  - Test:  Final 12 Hours                               - Preserves 0.172% fraud ratio
  (Evaluates temporal generalization)                   (Maximizes rare-class training data)
```

### Recommendation for ULB Dataset:
1. **Primary Evaluation: Stratified $K$-Fold Cross-Validation ($K=5$)**:
   * Guarantees each fold contains exactly $\approx 98$ positive fraud cases.
   * Prevents high-variance validation metrics caused by sparse minority classes.
2. **Holdout Validation: Temporal Split ($80\% / 20\%$)**:
   * Order dataset strictly by `Time`.
   * $t \le 138,240\text{ s}$ ($38.4\text{ h}$) $\rightarrow$ Training Set ($N \approx 227,845$).
   * $t > 138,240\text{ s}$ $\rightarrow$ Out-of-Time Test Set ($N \approx 56,962$).
   * Tests model resilience against temporal shift and avoids lookahead leakage.

> **CRITICAL RULE**: Preprocessing parameters (Median, IQR, Scaler fits, SMOTE transforms) must **only be fitted on the Training fold** and applied to the Test fold to prevent data leakage.

---

## 8. The Class Imbalance Problem & Why Accuracy is Invalid

At a fraud rate of $0.172\%$, a naive model that predicts `Class = 0` (Legitimate) for all transactions achieves **$99.83\%$ accuracy** while catching **$0\%$ of fraud**, resulting in complete operational failure.

### The Cost-Asymmetric Confusion Matrix

In payment systems, the financial cost of errors is asymmetric:
$$\text{Cost}(\text{False Negative}) \gg \text{Cost}(\text{False Positive})$$

* **False Negative (FN)**: Fraudster steals $\$1,500$. Direct financial loss, chargeback processing fee ($\approx \$25$), and interchange penalty.
* **False Positive (FP)**: Legitimate transaction blocked. Temporary cardholder friction, customer support call ($\approx \$5$), potential customer churn.

---

## 9. Comprehensive Comparison of Imbalance Mitigation Techniques

| Technique | Mathematical Mechanism | Pros | Cons / Operational Risk | Recommendation for SentinelAI |
| :--- | :--- | :--- | :--- | :--- |
| **1. Class Weights (Cost-Sensitive)** | Scales minority loss by $w_1 = \frac{N}{2 \cdot N_1}$, penalizing FN errors heavily during gradient descent. | • No synthetic distortion.<br>• Preserves real feature space.<br>• Zero training memory overhead. | • Output probabilities become uncalibrated (must be platt-scaled). | ⭐ **Highly Recommended** (Native, fast, stable) |
| **2. SMOTE (Synthetic Oversampling)** | Interpolates $k$-NN neighbors to synthesize minority instances: $\mathbf{x}_{\text{new}} = \mathbf{x}_i + \lambda (\mathbf{x}_{zi} - \mathbf{x}_i)$. | • Expands sparse minority decision boundaries. | • High risk of boundary blur in high dimensions.<br>• Synthesizes unrealistic transactions.<br>• Slower training. | ⚠️ **Use with caution** (Borderline-SMOTE only) |
| **3. Random Undersampling (RUS)** | Randomly discards legitimate transactions until ratio is $1:1$ or $1:10$. | • Extremely fast training.<br>• Equalizes class weights. | • Discards $95\%+$ of valuable legitimate patterns.<br>• High False Positive Rate in production. | ❌ **Not Recommended** (Severe information loss) |
| **4. XGBoost `scale_pos_weight`** | Modifies positive gradient step: $s = \frac{N_{\text{negative}}}{N_{\text{positive}}} \approx 577$. | • Directly integrated into tree split objective.<br>• Tunable hyperparameter. | • Can over-predict fraud if set purely to raw ratio (tune via PR-AUC). | ⭐ **Best in Class** (Industry standard for GBDT) |

### Optimal Strategy:
Set XGBoost `scale_pos_weight` in the range of $\sqrt{N_{\text{neg}} / N_{\text{pos}}} \approx 24$ to $N_{\text{neg}} / N_{\text{pos}} \approx 577$, tuned via cross-validated PR-AUC optimization.

---

## 10. Evaluation Strategy: Metrics & Decision Threshold Optimization

```
                               Metric Hierarchy
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
   [PR-AUC (Primary)]        [ROC-AUC (Baseline)]      [Cost-Utility Curve]
  - Precision-Recall Curve   - Sensitive to FP rate    - Minimizes total Expected
  - Unaffected by large TN   - Useful for rank-order    Cost: $C_{FN} + C_{FP}$
```

### 1. Primary Metric: PR-AUC (Precision-Recall Area Under Curve / Average Precision)
Because the true negative count ($N_{\text{legit}} = 284,315$) dwarfs positive fraud, ROC-AUC can remain deceptively high ($> 0.98$) even when Precision is abysmal. **PR-AUC directly penalizes False Positives on the rare class.**

### 2. Decision Threshold Tuning ($T_{\text{decision}}$)
Default threshold $0.50$ is suboptimal for imbalanced fraud. 
We sweep $T \in [0.01, 0.99]$ to find $T^*$ that minimizes the Expected Loss Function:

$$\min_{T} \mathcal{L}(T) = \sum_{i=1}^N \left[ c_{\text{FN}} \cdot \mathbb{I}(y_i=1, \hat{p}_i < T) \cdot \text{Amount}_i + c_{\text{FP}} \cdot \mathbb{I}(y_i=0, \hat{p}_i \ge T) \cdot C_{\text{friction}} \right]$$

---

## 11. End-to-End Model Training & Artifact Workflow

```
[Raw ULB CSV / DB]
       │
       ▼
[Train / Test Split] ──▶ (80% Train / 20% Stratified Holdout)
       │
       ▼
[Column Transformer] ──▶ (RobustScaler for Amount, Cyclical for Time, Pass V1-V28)
       │
       ▼
[Hyperparameter Tuning] ──▶ (Optuna: max_depth, scale_pos_weight, colsample_bytree, learning_rate)
       │
       ▼
[Model Training] ───────▶ (XGBoost Classifier + Early Stopping)
       │
       ▼
[Model Calibration] ────▶ (Isotonic Regression / Platt Scaling)
       │
       ▼
[SHAP TreeExplainer] ───▶ (Pre-compute Explainer & Base Values)
       │
       ▼
[Artifact Export] ──────▶ (model.joblib, preprocessor.joblib, explainer.joblib, metadata.json)
       │
       ▼
[Production Gateway] ───▶ [FastAPI Backend Service] (< 20ms Live Inference)
```
