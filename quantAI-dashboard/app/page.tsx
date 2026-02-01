'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  Activity,
  Shield,
  Target,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { api, PortfolioAnalysis } from '@/lib/api';
import {
  formatCurrency,
  formatPercentage,
  getValueColor,
  getConfidenceLevel,
} from '@/lib/utils';
import MetricCard from '@/components/MetricCard';
import RegimeIndicator from '@/components/RegimeIndicator';
import TickerSearch from '@/components/TickerSearch';
import PriceChart from '@/components/PriceChart';
import ExecutiveSummaryCard from '@/components/ExecutiveSummaryCard';
import ExportTools from '@/components/ExportTools';

export default function Dashboard() {
  const [selectedTicker, setSelectedTicker] = useState('GOOGL');
  const [tickers, setTickers] = useState<string[]>([]);
  const [assetClasses, setAssetClasses] = useState<Record<string, string>>({});
  const [portfolioData, setPortfolioData] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load available tickers
  useEffect(() => {
    const loadTickers = async () => {
      try {
        const data = await api.getTickers();
        setTickers(data.tickers);
        setAssetClasses(data.by_asset_class);
      } catch (err) {
        console.error('Failed to load tickers:', err);
      }
    };
    loadTickers();
  }, []);

  // Load portfolio analysis when ticker changes
  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPortfolioAnalysis(selectedTicker);
        setPortfolioData(data);
      } catch (err) {
        setError('Failed to load portfolio data. Please try again.');
        console.error('Failed to load portfolio data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTicker) {
      loadPortfolioData();
    }
  }, [selectedTicker]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-electric-blue border-t-transparent rounded-full"
          />
          <p className="text-electric-blue font-semibold text-lg">
            Loading Market Intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-strong rounded-xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-warning-orange mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-electric-blue hover:bg-cyber-cyan text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return null;
  }

  const latestPrice = portfolioData.market_data.data[0];
  const priceChange = latestPrice.log_return;
  const confidenceInfo = getConfidenceLevel(
    portfolioData.regime_prediction.confidence
  );

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl font-bold font-display mb-4">
            <span className="neon-text">QUANT</span>
            <span className="gold-text"> RESEARCH</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Professional-Grade Quantitative Finance Analytics
          </p>
        </motion.div>

        {/* Navigation CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Advanced Analytics CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              href="/analytics"
              className="block p-6 glass-strong rounded-xl border-2 border-neon-purple hover:border-electric-blue transition-all duration-300 hover:shadow-neon group"
            >
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-neon-purple group-hover:text-electric-blue transition-colors" />
                <div className="flex-1">
                  <div className="font-bold text-white text-xl mb-1">
                    Advanced Analytics
                  </div>
                  <div className="text-sm text-gray-400">
                    Monte Carlo, Alpha Signals, Factor Analysis & More
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-electric-blue text-2xl"
                >
                  →
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Portfolio Tools CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Link
              href="/portfolio"
              className="block p-6 glass-strong rounded-xl border-2 border-gold-accent hover:border-profit-green transition-all duration-300 hover:shadow-gold group"
            >
              <div className="flex items-center gap-4">
                <Target className="w-8 h-8 text-gold-accent group-hover:text-profit-green transition-colors" />
                <div className="flex-1">
                  <div className="font-bold text-white text-xl mb-1">
                    Portfolio Tools
                  </div>
                  <div className="text-sm text-gray-400">
                    Multi-Ticker Comparison, Optimization & Watchlist
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-profit-green text-2xl"
                >
                  →
                </motion.div>
              </div>
            </Link>
          </motion.div>
        </div>


        {/* Ticker Search */}
        <div className="flex justify-center">
          <TickerSearch
            tickers={tickers}
            assetClasses={assetClasses}
            onSelect={setSelectedTicker}
            selectedTicker={selectedTicker}
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Current Price"
            value={formatCurrency(latestPrice.Close)}
            subtitle={`${formatPercentage(priceChange)} today`}
            icon={TrendingUp}
            trend={priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'neutral'}
            color={priceChange > 0 ? 'green' : priceChange < 0 ? 'red' : 'blue'}
            delay={0}
          />

          <MetricCard
            title="Sharpe Ratio"
            value={portfolioData.risk_metrics.sharpe_ratio.toFixed(2)}
            subtitle="Risk-adjusted returns"
            icon={Activity}
            color="blue"
            delay={0.1}
          />

          <MetricCard
            title="Max Drawdown"
            value={formatPercentage(portfolioData.risk_metrics.max_drawdown / 100)}
            subtitle="Peak-to-trough decline"
            icon={AlertTriangle}
            color="orange"
            delay={0.2}
          />

          <MetricCard
            title="Expected Return"
            value={formatPercentage(portfolioData.risk_metrics.expected_return / 100)}
            subtitle="Annualized projection"
            icon={Target}
            color="gold"
            delay={0.3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Chart - Spans 2 columns */}
          <div className="lg:col-span-2">
            <PriceChart
              data={portfolioData.market_data.data}
              ticker={selectedTicker}
            />
          </div>

          {/* Regime Indicator */}
          <div>
            <RegimeIndicator
              regime={portfolioData.regime_prediction.predicted_regime_21d}
              confidence={portfolioData.regime_prediction.confidence}
              probabilities={portfolioData.regime_prediction.probabilities}
            />
          </div>
        </div>

        {/* Executive Summary & Risk Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Executive Summary */}
          <div className="lg:col-span-2">
            <ExecutiveSummaryCard
              summary={portfolioData.executive_summary.summary}
              warnings={portfolioData.strategy_recommendation.recommendation.warnings}
            />
          </div>

          {/* Export Tools */}
          <div>
            <ExportTools data={portfolioData} ticker={selectedTicker} />
          </div>
        </div>

        {/* Strategy Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strategy Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-strong rounded-xl p-6 border border-electric-blue/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-electric-blue" />
              <h3 className="text-lg font-bold font-display text-electric-blue">
                Portfolio Strategy
              </h3>
            </div>

            <div className="space-y-4">
              {/* Risk Posture */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Risk Posture</div>
                <div className="text-xl font-bold text-white">
                  {portfolioData.strategy_recommendation.recommendation.risk_posture.replace(
                    /_/g,
                    ' '
                  )}
                </div>
              </div>

              {/* Strategy */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Primary Strategy</div>
                <div className="text-xl font-bold text-electric-blue">
                  {portfolioData.strategy_recommendation.recommendation.primary_strategy.replace(
                    /_/g,
                    ' '
                  )}
                </div>
              </div>

              {/* Equity Exposure */}
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  Recommended Equity Exposure
                </div>
                <div className="h-3 bg-slate-dark/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${portfolioData.strategy_recommendation.recommendation.equity_exposure * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-profit-green to-emerald-400 rounded-full"
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-lg font-bold text-profit-green">
                    {formatPercentage(
                      portfolioData.strategy_recommendation.recommendation.equity_exposure
                    )}
                  </span>
                </div>
              </div>

              {/* Asset Preference */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Asset Preference</div>
                <div className="text-base text-gray-300">
                  {portfolioData.strategy_recommendation.recommendation.asset_preference}
                </div>
              </div>

              {/* Position Sizing */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-dark">
                <div>
                  <div className="text-sm text-gray-400">Position Sizing</div>
                  <div className="text-base font-semibold text-white">
                    {portfolioData.strategy_recommendation.recommendation.position_sizing}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Rebalancing</div>
                  <div className="text-base font-semibold text-white">
                    {portfolioData.strategy_recommendation.recommendation.rebalancing_frequency}
                  </div>
                </div>
              </div>

              {/* Confidence Badge */}
              <div className="pt-4 border-t border-slate-dark">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Recommendation Confidence
                  </span>
                  <span className={`text-lg font-bold ${confidenceInfo.color}`}>
                    {confidenceInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>


        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 text-sm py-8"
        >
          <p>
            Powered by Advanced Quantitative Models • Real-time Market Data
          </p>
          <p className="mt-2">
            Data updated: {new Date(portfolioData.timestamp).toLocaleString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
