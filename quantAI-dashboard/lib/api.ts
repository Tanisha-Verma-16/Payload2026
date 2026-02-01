const API_BASE_URL = 'https://quant-research-api.onrender.com';

export interface Ticker {
  symbol: string;
  assetClass: string;
}

export interface MarketData {
  ticker: string;
  data_points: number;
  data: Array<{
    Date: string;
    Ticker: string;
    Close: number;
    Open: number;
    High: number;
    Low: number;
    Volume: number;
    log_return: number;
    vol_20d: number;
    vol_60d: number;
  }>;
}

export interface RegimePrediction {
  ticker: string;
  date: string;
  current_regime: string;
  predicted_regime_21d: string;
  confidence: number;
  probabilities: {
    LOW_VOL: number;
    NORMAL_VOL: number;
    HIGH_VOL: number;
  };
}

export interface StrategyRecommendation {
  ticker: string;
  date: string;
  prediction: {
    regime: string;
    confidence: number;
  };
  recommendation: {
    regime: string;
    risk_posture: string;
    primary_strategy: string;
    equity_exposure: number;
    hedge_recommendation: boolean;
    asset_preference: string;
    position_sizing: string;
    rebalancing_frequency: string;
    confidence: string;
    rationale: string[];
    warnings: string[];
  };
}

export interface RiskMetrics {
  sharpe_ratio: number;
  max_drawdown: number;
  worst_drawdown: number;
  calmar_ratio: number;
  var_95: number;
  cvar_95: number;
  prob_loss: number;
  expected_return: number;
  return_std: number;
}

export interface ExecutiveSummary {
  ticker: string;
  timestamp: string;
  summary: {
    outlook: string;
    reasoning: string;
    recommendation: string;
    full_summary: string;
  };
}

export interface PortfolioAnalysis {
  ticker: string;
  timestamp: string;
  market_data: MarketData;
  regime_prediction: RegimePrediction;
  strategy_recommendation: StrategyRecommendation;
  executive_summary: ExecutiveSummary;
  risk_metrics: RiskMetrics;
}

class QuantAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async fetchJSON<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async getTickers(): Promise<{ total: number; tickers: string[]; by_asset_class: Record<string, string> }> {
    return this.fetchJSON('/api/tickers');
  }

  async getMarketData(ticker: string, limit: number = 100): Promise<MarketData> {
    return this.fetchJSON(`/api/market-data/${ticker}?limit=${limit}`);
  }

  async getRegimePrediction(ticker: string): Promise<RegimePrediction> {
    return this.fetchJSON(`/api/predict-regime/${ticker}`);
  }

  async getStrategyRecommendation(ticker: string): Promise<StrategyRecommendation> {
    return this.fetchJSON(`/api/strategy-recommendation/${ticker}`);
  }

  async getRiskMetrics(): Promise<RiskMetrics> {
    return this.fetchJSON('/api/risk-metrics');
  }

  async getExecutiveSummary(ticker: string, useLLM: boolean = true): Promise<ExecutiveSummary> {
    return this.fetchJSON(`/api/executive-summary/${ticker}?use_llm=${useLLM}`);
  }

  async getPortfolioAnalysis(ticker: string): Promise<PortfolioAnalysis> {
    return this.fetchJSON(`/api/portfolio-analysis/${ticker}`);
  }

  async getAlphaSignals(ticker: string, limit: number = 50) {
    return this.fetchJSON(`/api/alpha-signals/${ticker}?limit=${limit}`);
  }

  async getTopMomentum(topN: number = 10, assetClass?: string) {
    const params = assetClass ? `?top_n=${topN}&asset_class=${assetClass}` : `?top_n=${topN}`;
    return this.fetchJSON(`/api/top-momentum${params}`);
  }

  async getCorrelations(tickers: string[]) {
    return this.fetchJSON(`/api/correlations?tickers=${tickers.join(',')}`);
  }

  async getMonteCarloResults() {
    return this.fetchJSON('/api/monte-carlo');
  }

  async getFactorImportance() {
    return this.fetchJSON('/api/factor-importance');
  }
}

export const api = new QuantAPI();
