# Quantitative Research Platform

An end-to-end quantitative finance system for multi-asset factor research, ML-based volatility regime prediction, Monte Carlo risk simulation, and rule-based portfolio strategy generation.

The platform takes raw OHLCV market data and produces explainable portfolio guidance — covering everything from academic momentum factors through XGBoost classification, SHAP interpretability, and plain-English executive summaries.

---

## Table of Contents

1. [What This System Does](#what-this-system-does)
2. [Factor Engineering](#factor-engineering)
   - [Returns](#returns)
   - [Momentum Factors](#momentum-factors)
   - [Technical Indicators](#technical-indicators)
   - [Mean Reversion](#mean-reversion)
   - [Volatility](#volatility)
   - [Cross-Sectional Features](#cross-sectional-features)
   - [Composite Alpha Signals](#composite-alpha-signals)
3. [Volatility Regime Classification](#volatility-regime-classification)
   - [Why Predict Regimes](#why-predict-regimes)
   - [Model Architecture](#model-architecture)
   - [Walk-Forward Validation](#walk-forward-validation)
   - [Target Engineering](#target-engineering)
4. [SHAP Interpretability](#shap-interpretability)
   - [Why Explainability Matters](#why-explainability-matters)
   - [Three Levels of Explanation](#three-levels-of-explanation)
5. [Monte Carlo Simulation](#monte-carlo-simulation)
   - [Why Not Just Use Historical Returns](#why-not-just-use-historical-returns)
   - [Volatility Clustering](#volatility-clustering)
   - [Risk Metrics](#risk-metrics)
6. [Portfolio Strategy Engine](#portfolio-strategy-engine)
   - [Decision Logic](#decision-logic)
   - [Tail Risk Gating](#tail-risk-gating)
   - [Why Rule-Based](#why-rule-based)
7. [Financial Reasoning Agent](#financial-reasoning-agent)
8. [Data Leakage Prevention](#data-leakage-prevention)
9. [Tech Stack](#tech-stack)

---

## What This System Does

The pipeline runs in four logical stages:

```
Raw Market Data  →  Factor Engineering  →  ML + Simulation  →  Portfolio Guidance
```

**Stage 1** downloads and cleans OHLCV data for 100+ tickers across indices, equities, ETFs, commodities, and FX. It engineers base features like log returns and rolling volatility.

**Stage 2** builds 30+ alpha factors — academic momentum, technical indicators computed from first principles, mean reversion signals, cross-sectional ranks, and regime-weighted composite alphas. Everything runs in pure Polars with no external indicator libraries.

**Stage 3** trains an XGBoost classifier to predict volatility regimes 21 days ahead, runs SHAP analysis to explain why, and simulates 1,000 forward portfolio paths with regime-switching volatility.

**Stage 4** converts all model outputs into rule-based strategy recommendations and plain-English executive summaries.

---

## Factor Engineering

All factors are computed in pure Polars — vectorized, with no dependency on `pandas_ta` or similar libraries. Each indicator is implemented directly from its mathematical definition.

### Returns

**Log Returns**

```
log_return(t) = ln(Close(t)) - ln(Close(t-1))
```

Log returns are used throughout instead of simple returns because they are continuously compounded, symmetric around zero, and additive across time. A -50% simple return requires a +100% recovery; a -0.693 log return requires exactly +0.693.

### Momentum Factors

Momentum is one of the most well-documented factors in empirical finance. The core idea: assets that have performed well recently tend to continue performing well over medium-term horizons (3–12 months). This was first systematically documented by Jegadeesh and Titman (1993).

**12-1 Momentum (Jegadeesh & Titman 1993)**

```
mom_12_1(t) = Close(t - 21) / Close(t - 252) - 1
```

This is the most important detail in the momentum implementation. The formula deliberately excludes the most recent month (21 trading days). Why? Short-term price reversals are well-documented over 1-month horizons — assets that spike up tend to pull back. Including the last month in a 12-month momentum signal actually _hurts_ predictive power. The original Jegadeesh & Titman paper showed this explicitly, and it has been replicated dozens of times since.

- `Close(t - 21)` is the price one month ago
- `Close(t - 252)` is the price one year ago
- The ratio captures the 11-month trend, skipping the noisy final month

**Other Momentum Windows**

```
mom_6m(t)  = Close(t) / Close(t - 126) - 1     # 6 months
mom_3m(t)  = Close(t) / Close(t - 63)  - 1     # 3 months
mom_1m(t)  = Close(t) / Close(t - 21)  - 1     # 1 month (reversal signal)
mom_1w(t)  = Close(t) / Close(t - 5)   - 1     # 1 week
```

Trading days used: 21/month, 63/quarter, 126/half-year, 252/year. These are standard conventions.

### Technical Indicators

#### RSI — Relative Strength Index (Wilder, 1978)

```
gain(t) = max(Close(t) - Close(t-1), 0)
loss(t) = max(Close(t-1) - Close(t), 0)

avg_gain(t) = (avg_gain(t-1) × (period - 1) + gain(t)) / period
avg_loss(t) = (avg_loss(t-1) × (period - 1) + loss(t)) / period

RS(t)  = avg_gain(t) / avg_loss(t)
RSI(t) = 100 - (100 / (1 + RS(t)))
```

RSI measures the ratio of upward to downward price movement over a lookback window. Values above 70 are conventionally considered overbought; below 30, oversold.

The smoothing method matters. Wilder's original formula uses an exponential moving average with `alpha = 1/period`, which is different from the standard EMA formula (`alpha = 2/(period+1)`). Using the wrong alpha produces RSI values that are subtly but consistently off. This implementation uses Wilder's original definition.

#### MACD — Moving Average Convergence Divergence (Appel, 1979)

```
EMA_fast(t)   = EMA(Close, period=12)
EMA_slow(t)   = EMA(Close, period=26)

MACD_line(t)  = EMA_fast(t) - EMA_slow(t)
Signal(t)     = EMA(MACD_line, period=9)
Histogram(t)  = MACD_line(t) - Signal(t)
```

The EMA alpha values follow the standard convention: `alpha = 2 / (period + 1)`.

- **MACD Line** crossing above zero indicates the short-term trend is overtaking the long-term trend (bullish).
- **Signal Line** is a smoothed version of the MACD line itself — crossovers between the two are the primary trading signal.
- **Histogram** shows the distance between MACD and Signal. Increasing histogram suggests strengthening momentum.

#### Bollinger Bands (Bollinger, 1992)

```
Middle(t) = SMA(Close, period=20)
Std(t)    = StdDev(Close, period=20)

Upper(t)  = Middle(t) + 2 × Std(t)
Lower(t)  = Middle(t) - 2 × Std(t)

%B(t)     = (Close(t) - Lower(t)) / (Upper(t) - Lower(t))
Width(t)  = (Upper(t) - Lower(t)) / Middle(t)
```

- **%B** normalizes price position within the bands: 0 = at the lower band, 0.5 = at the middle, 1 = at the upper band. Values outside [0, 1] mean the price has broken out of the bands.
- **Bandwidth** is a volatility measure. Narrowing bands historically precede breakouts (the "Bollinger Squeeze").

#### ATR — Average True Range (Wilder, 1978)

```
TrueRange(t) = max(
    High(t) - Low(t),
    |High(t) - Close(t-1)|,
    |Low(t)  - Close(t-1)|
)

ATR(t) = EWM(TrueRange, alpha = 1/period)
```

True Range extends the simple high-low range to account for overnight gaps. If a stock closes at 100 and opens the next day at 95 (a gap down), the simple high-low range misses that 5-point move. True Range captures it.

ATR is used later in the pipeline as a proxy for realized volatility and as a tail-risk indicator.

### Mean Reversion

Mean reversion signals identify when an asset's price has deviated significantly from its recent average — the hypothesis being that prices tend to revert toward their mean over time.

**Price Z-Score**

```
zscore_Nd(t) = (Close(t) - SMA(Close, N)) / StdDev(Close, N)
```

Computed for N = 20, 50, and 200 days. A z-score of +2 means the price is two standard deviations above its N-day average — historically elevated. A z-score of -2 means historically depressed.

**RSI-Based Mean Reversion**

```
rsi_mean_rev(t) = (RSI(t) - 50) / 50
```

Centers RSI around zero. Negative values indicate oversold conditions (potential buy signal for mean reversion). Positive values indicate overbought conditions.

**Bollinger %B Mean Reversion**

```
bb_mean_rev(t) = %B(t) - 0.5
```

Centers %B around zero. Same logic as the RSI signal — negative means below the middle band, positive means above.

### Volatility

**Rolling Volatility**

```
vol_Nd(t) = StdDev(log_return, window=N)
```

Computed for N = 20 (one month) and N = 60 (three months). Rolling standard deviation of log returns is the standard measure of realized volatility.

**Z-Scored Volatility**

```
z_vol(t) = (vol_20d(t) - Mean(vol_20d, window=252)) / StdDev(vol_20d, window=252)
```

Normalizes current volatility against its own one-year history. A z-score above 2 means volatility is significantly elevated relative to recent norms — this is the primary input to the regime classifier.

**Volatility Regime Labels**

```
if z_vol > 2.0  → HIGH_VOL
if z_vol < -1.0 → LOW_VOL
otherwise       → NORMAL_VOL
```

These thresholds are asymmetric by design. High volatility is a more urgent condition than low volatility — the system is more sensitive to spikes than to calm.

### Cross-Sectional Features

Cross-sectional analysis ranks each asset _relative to its peers_ on each date. This is essential for long/short strategies — you're not betting on whether an asset goes up in absolute terms, but whether it outperforms or underperforms its group.

**Momentum Rank (Percentile)**

```
rank(t) = DenseRank(mom_factor, within Date × AssetClass) / Count(within Date × AssetClass) × 100
```

Produces a 0–100 percentile score. An asset with a rank of 90 has higher momentum than 90% of its peers on that date.

**Momentum Decile**

```
decile(t) = floor(mom_6m_rank / 10), clipped to [0, 9]
```

Bins assets into 10 groups. Decile 9 = top momentum, Decile 0 = bottom. Standard construction for long/short momentum portfolios: go long decile 9, short decile 0.

### Composite Alpha Signals

Individual factors are noisy. Combining them reduces noise and captures different dimensions of expected return.

**Z-Scoring Within Date**

Before combining, each factor is standardized across all assets on each date:

```
factor_z(t) = (factor(t) - Mean(factor, on date t)) / StdDev(factor, on date t)
```

This ensures factors on different scales (e.g., a percentage vs. a rank) are comparable.

**Momentum Alpha**

```
alpha_momentum = 0.2 × mom_12_1_rank_z + 0.5 × mom_6m_rank_z + 0.3 × mom_3m_rank_z
```

6-month momentum gets the highest weight (0.5) because it has the strongest empirical track record in the academic literature. 12-1 month gets less weight because it's noisier at the single-asset level despite being theoretically sound.

**Mean Reversion Alpha**

```
alpha_mean_reversion = -1 × (0.4 × zscore_50d_z + 0.3 × rsi_mean_rev_z + 0.3 × bb_mean_rev_z)
```

The negative sign is critical. Mean reversion is a contrarian signal — when the z-score is _positive_ (price above average), the expected return is _negative_ (price should fall back). Multiplying by -1 flips the signal so that positive alpha still means "expected to outperform."

**Combined Alpha (Regime-Dependent)**

```
if vol_regime == LOW_VOL:
    alpha_combined = 0.7 × alpha_momentum + 0.3 × alpha_mean_reversion

if vol_regime == HIGH_VOL:
    alpha_combined = 0.3 × alpha_momentum + 0.7 × alpha_mean_reversion

if vol_regime == NORMAL_VOL:
    alpha_combined = 0.5 × alpha_momentum + 0.5 × alpha_mean_reversion
```

This weighting is grounded in empirical research. Momentum strategies historically suffer during market crashes (high-volatility regimes) because they are long the assets that fall hardest. Mean reversion strategies, by contrast, tend to do well when prices overshoot and snap back. The regime-dependent blend adapts the portfolio's strategy to current market conditions.

---

## Volatility Regime Classification

### Why Predict Regimes

Markets behave fundamentally differently depending on volatility levels. In calm markets, trends persist and momentum strategies work. In turbulent markets, trends reverse sharply and mean reversion dominates. Position sizing, hedging decisions, and asset allocation all depend on which environment you're in.

A regime classifier doesn't predict whether the market goes up or down. It predicts _what kind of market_ the next month will be — and that determines which strategy to run.

### Model Architecture

**Algorithm:** XGBoost (gradient-boosted decision trees)

**Target:** Volatility regime 21 trading days in the future (LOW_VOL, NORMAL_VOL, or HIGH_VOL)

**Features:** All numeric columns from the factor engineering stage — momentum signals, technical indicators, mean reversion z-scores, volatility measures, microstructure features, and composite alphas.

**Hyperparameters:**

```python
params = {
    'objective': 'multi:softmax',
    'num_class': 3,
    'max_depth': 6,
    'eta': 0.1,              # learning rate
    'subsample': 0.8,        # row sampling per tree
    'colsample_bytree': 0.8, # feature sampling per tree
    'eval_metric': 'mlogloss',
    'seed': 42
}
```

- `max_depth=6` prevents overfitting by limiting tree complexity.
- `subsample` and `colsample_bytree` add randomness, which regularizes the model.
- `eta=0.1` is a conservative learning rate — the model learns slowly and generalizes better.

### Walk-Forward Validation

Standard k-fold cross-validation is invalid for time-series data. If you randomly split the data, training samples from the future will leak into evaluation, making the model appear far more accurate than it actually is.

Walk-forward validation solves this by enforcing strict temporal ordering:

```
Fold 1:  [────Train────] [─Test─]
Fold 2:  [─────────Train──────] [─Test─]
Fold 3:  [────────────Train───────────] [─Test─]
Fold 4:  [─────────────────Train──────────────] [─Test─]
Fold 5:  [──────────────────────Train───────────────────] [─Test─]
```

Every test fold contains only data that is strictly in the future relative to all training data. This is how the model would actually perform if deployed.

The implementation uses scikit-learn's `TimeSeriesSplit` with 5 folds.

### Target Engineering

This is the single most important detail in the ML pipeline.

A naive implementation would predict the _current_ regime using _current_ features. That's useless in practice — you already know what regime you're in right now. What you need is to predict what regime will exist _next month_, using only information available _today_.

```python
future_regime = vol_regime.shift(-21).over("Ticker")
```

The target is shifted 21 days forward. The model learns to predict next month's regime from today's features. This 21-day gap also prevents any subtle leakage between features and target — there is no temporal overlap.

---

## SHAP Interpretability

### Why Explainability Matters

A model that predicts "HIGH_VOL" with 85% confidence is only useful if someone can understand _why_ it made that prediction. In finance, "trust" is not optional. A risk officer who cannot explain a model's reasoning to their superiors will not act on it, regardless of its accuracy.

SHAP (SHapley Additive exPlanations) provides that explanation. It is grounded in cooperative game theory — each feature's contribution to a prediction is computed as if the features were "players" contributing to a shared outcome, and Shapley values assign each player their fair share of the total.

### Three Levels of Explanation

**Global Importance — What features matter most overall?**

```
global_importance(feature) = Mean(|SHAP(feature)|) across all samples and all classes
```

This tells you which features the model relies on most, regardless of the specific prediction. Typically `z_vol` and `atr_14` dominate for this model — which makes intuitive sense for a volatility regime classifier.

**Class-Specific Importance — What drives predictions for a specific regime?**

```
class_importance(feature, class) = Mean(|SHAP(feature, class)|) across all samples
```

This answers questions like "what makes the model predict HIGH_VOL specifically?" The drivers for HIGH_VOL and LOW_VOL are often different features, which validates that the model is learning genuinely distinct patterns for each regime.

**Local Explanation — Why did the model predict X for this specific case?**

For a single observation, SHAP values decompose the prediction into individual feature contributions:

```
prediction = base_value + SHAP(feature_1) + SHAP(feature_2) + ... + SHAP(feature_n)
```

- `base_value` is the model's expected prediction with no information (the average prediction across training data).
- Each `SHAP(feature_i)` is positive (pushes toward this class) or negative (pushes away).
- They sum exactly to the difference between the base value and the final prediction.

This lets you say: "The model predicted HIGH_VOL primarily because `z_vol = 2.4` (contributing +0.32) and `atr_14` was elevated (contributing +0.21), partially offset by strong momentum (contributing -0.15)."

---

## Monte Carlo Simulation

### Why Not Just Use Historical Returns

Historical return distributions have two properties that make naive simulation dangerous:

1. **Fat tails (excess kurtosis).** Real market returns have more extreme outliers than a normal distribution predicts. A model assuming normality will underestimate the probability of large losses.

2. **Volatility clustering.** High-volatility days tend to be followed by more high-volatility days. A model that draws each day's return independently from a fixed distribution misses this entirely — and will systematically underestimate maximum drawdown during market stress.

### Volatility Clustering

The simulation models volatility clustering by adapting each path's volatility dynamically:

```
For each path i, each day t:
    if t > 20:
        recent_vol(i,t)  = StdDev(log(path[t-20:t] / path[t-21:t-1]))
        vol_ratio(i,t)   = recent_vol(i,t) / historical_vol
        current_std(i,t) = historical_vol × vol_ratio(i,t)
    else:
        current_std(i,t) = historical_vol

    return(i,t)  = Normal(mu, current_std(i,t))
    path[i,t]    = path[i,t-1] × exp(return(i,t))
```

When a path enters a high-volatility period, subsequent days in that path are drawn from a wider distribution. This reproduces the clustering behavior observed in real markets. Each of the 1,000 paths evolves independently, producing a distribution of possible futures rather than a single point estimate.

### Risk Metrics

All metrics are computed from the distribution across the 1,000 simulated paths.

**Sharpe Ratio**

```
Sharpe = Mean(total_return) / StdDev(total_return)
```

Risk-adjusted return. Assumes a zero risk-free rate for simplicity. A Sharpe above 1.0 indicates the return exceeds the volatility taken to achieve it.

**Maximum Drawdown**

```
For each path:
    cummax(t) = max(path[0:t])
    drawdown(t) = (path[t] - cummax(t)) / cummax(t)
    max_dd = min(drawdown)

Average max drawdown = Mean(max_dd across all paths)
Worst drawdown       = Min(max_dd across all paths)
```

Drawdown measures peak-to-trough decline. It captures the worst loss an investor would have experienced if they held through. The average across paths gives the expected worst loss; the minimum across paths gives the tail-risk worst case.

**Value at Risk (VaR, 95%)**

```
VaR_95 = Percentile(total_returns, 5)
```

The 5th percentile of the return distribution. "In 95% of simulated scenarios, the loss does not exceed this amount."

**Conditional VaR (CVaR, 95%) — Expected Shortfall**

```
CVaR_95 = Mean(total_returns where total_return ≤ VaR_95)
```

The average loss _given that_ you are in the worst 5% of outcomes. CVaR is more informative than VaR for tail-risk management because it answers "how bad does it get when things go wrong?" rather than just "where is the boundary?"

**Calmar Ratio**

```
Calmar = Mean(total_return) / |Average max drawdown|
```

Return per unit of drawdown risk. Higher is better. Useful for comparing strategies that target similar returns but have different drawdown profiles.

---

## Portfolio Strategy Engine

### Decision Logic

The strategy engine is a rule-based system — not an ML model. This is deliberate. Rule-based systems are transparent, auditable, and easy to modify. Every decision has an explicit rationale that can be traced back to a specific input condition.

The engine operates in five sequential steps:

**Step 1 — Regime → Risk Posture**

```
LOW_VOL  + confidence > 70%  →  RISK_ON       (equity exposure: 85%)
LOW_VOL  + confidence ≤ 70%  →  CAUTIOUS      (equity exposure: 70%)
NORMAL_VOL                   →  NEUTRAL       (equity exposure: 60%)
HIGH_VOL + confidence > 70%  →  RISK_OFF      (equity exposure: 35%)
HIGH_VOL + confidence ≤ 70%  →  DEFENSIVE     (equity exposure: 50%)
```

**Step 2 — Tail Risk → Hedging Decision**

Three independent tail-risk indicators are checked:

```
Flag 1: CVaR(95%) < -10%           (expected shortfall exceeds threshold)
Flag 2: Excess Kurtosis > 3.0      (fat tails detected)
Flag 3: Skewness < -0.5            (asymmetric downside risk)

if flags ≥ 2  OR  regime == HIGH_VOL:
    hedge = ENABLED
```

Each flag captures a different dimension of tail risk. Requiring two or more flags before triggering hedging prevents false positives from a single noisy indicator.

**Step 3 — Factor Dominance → Strategy**

```
LOW_VOL  + momentum > 1.0  →  MOMENTUM
LOW_VOL  + momentum < -1.0 →  CONTRARIAN (momentum exhaustion)
HIGH_VOL + mean_rev > 1.0  →  MEAN_REVERSION
HIGH_VOL + mean_rev < -1.0 →  WAIT (overbought in high vol)
NORMAL   + strongest signal →  TILT toward that factor
```

The threshold of 1.0 (one standard deviation) is the conventional boundary for statistical significance in z-scored signals.

**Step 4 — Asset Preference**

```
LOW_VOL  →  Growth, High-Beta, Small-Cap
NORMAL   →  Quality, Balanced
HIGH_VOL →  Defensive, Low-Beta, Utilities, Staples
HIGH_VOL + hedge enabled →  Add Gold, Long-Duration Treasuries
```

**Step 5 — Position Sizing and Rebalancing**

```
Position size:
    HIGH_VOL or tail_risk_flags ≥ 2  →  0.5–1% per position
    NORMAL_VOL                       →  1–2% per position
    LOW_VOL + high confidence        →  2–3% per position

Rebalancing frequency:
    HIGH_VOL   →  Weekly    (risk drift in volatile markets)
    NORMAL_VOL →  Bi-weekly
    LOW_VOL    →  Monthly   (minimize transaction costs)
```

### Tail Risk Gating

The tail-risk gate is the system's primary defense against catastrophic loss. It operates independently of the regime prediction — even if the regime classifier is wrong or slow to react, the tail-risk indicators (CVaR, kurtosis, skewness) can still trigger defensive action.

This separation is important. The regime classifier is a forward-looking model with inherent uncertainty. The tail-risk indicators are backward-looking facts about the current distribution. Using both layers provides defense in depth.

### Why Rule-Based

ML models can theoretically learn optimal strategy allocation. But in finance, "optimal" is fragile — it depends on assumptions about future distributions that may not hold. A rule-based system with documented logic can be:

- Audited by risk committees
- Modified when market conditions change
- Understood by non-technical stakeholders
- Debugged when it produces unexpected output

The strategy engine is explicitly a decision-support tool. It surfaces information and recommendations. The final decision remains with a human.

---

## Financial Reasoning Agent

The reasoning agent converts all quantitative outputs into a 3-sentence plain-English executive summary.

**Why this exists:** A risk officer does not need to know that `z_vol = 2.4` or that `CVaR(95%) = -18%`. They need to know: "The market is showing signs of elevated turbulence. The risk of sharp, asymmetric losses is higher than normal. We recommend reducing exposure and enabling hedging while monitoring for stabilization."

The agent uses a structured prompt template that:

1. Provides exact numerical inputs to the LLM (regime, confidence, SHAP drivers, risk metrics, distribution stats, strategy output)
2. Translates technical feature names into plain English before passing them (`z_vol` → "volatility levels", `atr_14` → "recent price swings")
3. Constrains the output format: exactly 3 sentences with prescribed roles (outlook, reasoning, recommendation)
4. Forbids jargon, overpromising language, and buy/sell directives
5. Requires a hedge phrase in the recommendation ("while monitoring...", "if conditions hold")

Template responses are included for all three regime scenarios, so the system produces valid output even without a live LLM API connection.

---

## Data Leakage Prevention

Data leakage — when future information inadvertently influences a model's training or evaluation — is the most common source of false confidence in quantitative backtesting. A model that leaks produces backtest results that look excellent but fail in live trading.

This pipeline runs six independent checks after factor engineering completes:

**Check 1 — Chronological Ordering**
Verifies that all dates within each ticker are strictly sorted. Any out-of-order rows would indicate a processing bug.

**Check 2 — Lookback Null Validation**
Features with N-day lookback windows should be null for the first N-1 rows of each ticker. An RSI-14 value on row 5 would mean it was computed with insufficient history — a sign of incorrect windowing.

**Check 3 — Lookback Period Alignment**
Validates that each feature's first non-null value appears at approximately the correct index. Allows a small tolerance for EMA warmup (EMA-based indicators converge gradually rather than having a hard cutoff).

**Check 4 — Cross-Sectional Rank Bounds**
Percentile ranks must fall within [0, 100] on every date. Values outside this range indicate a bug in the ranking logic.

**Check 5 — Alpha Signal Normalization**
Composite alpha signals are z-scored within each date. Their mean should be near 0 and standard deviation near 1. Significant deviations indicate the normalization step failed.

**Check 6 — Future Information Isolation**
For a randomly selected row, verifies that the number of historical rows available equals or exceeds the row's index. This confirms no future rows were used in any computation.

All six checks must pass before the dataset is saved. If any fail, the pipeline raises an assertion error.

---

---

## Tech Stack

| Layer            | Technology                     | Why                                                                   |
| ---------------- | ------------------------------ | --------------------------------------------------------------------- |
| Data processing  | Polars                         | Vectorized, 100× faster than pandas for rolling/group operations      |
| Data download    | yfinance                       | Multi-ticker OHLCV with parallel fetch                                |
| ML               | XGBoost                        | Fast training, handles feature interactions well, native SHAP support |
| Interpretability | SHAP (TreeExplainer)           | Exact Shapley values for tree models, game-theory grounded            |
| Simulation       | NumPy                          | Vectorized path generation                                            |
| Risk stats       | SciPy                          | Skewness, kurtosis, distribution fitting                              |
| Time-series CV   | scikit-learn (TimeSeriesSplit) | Correct walk-forward splitting                                        |
| API              | FastAPI                        |
