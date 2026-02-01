'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import MultiTickerComparison from '@/components/MultiTickerComparison';
import Watchlist from '@/components/Watchlist';
import PortfolioOptimizer from '@/components/PortfolioOptimizer';
import BatchAnalysis from '@/components/BatchAnalysis';

export default function PortfolioTools() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(['GOOGL', 'AAPL', 'MSFT']);
  const [availableTickers, setAvailableTickers] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingTicker, setIsAddingTicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load available tickers
  useEffect(() => {
    const loadTickers = async () => {
      try {
        const data = await api.getTickers();
        setAvailableTickers(data.tickers);
      } catch (err) {
        console.error('Failed to load tickers:', err);
      }
    };
    loadTickers();
  }, []);

  // Load comparison data
  useEffect(() => {
    const loadComparisonData = async () => {
      if (selectedTickers.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        // Load portfolio analysis for each ticker
        const dataPromises = selectedTickers.map(ticker =>
          api.getPortfolioAnalysis(ticker)
        );
        const results = await Promise.all(dataPromises);
        setComparisonData(results);
      } catch (err) {
        setError('Failed to load comparison data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, [selectedTickers]);

  const handleAddTicker = (ticker: string) => {
    if (!selectedTickers.includes(ticker) && selectedTickers.length < 6) {
      setSelectedTickers([...selectedTickers, ticker]);
      setSearchTerm('');
      setIsAddingTicker(false);
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter(t => t !== ticker));
  };

  const handleWatchlistSelect = (ticker: string) => {
    if (!selectedTickers.includes(ticker)) {
      setSelectedTickers([ticker, ...selectedTickers.slice(0, 5)]);
    }
  };

  const filteredTickers = availableTickers.filter(ticker =>
    ticker.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTickers.includes(ticker)
  );

  if (loading && comparisonData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-electric-blue font-semibold text-lg">
            Loading Portfolio Tools...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-electric-blue hover:text-cyber-cyan transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold font-display mb-2">
            <span className="neon-text">Portfolio</span>
            <span className="gold-text"> Tools</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Multi-ticker analysis, optimization & watchlist management
          </p>
        </motion.div>

        {/* Ticker Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl p-6 border border-electric-blue/30"
        >
          <h3 className="text-lg font-bold text-electric-blue mb-4">
            Selected Tickers for Comparison ({selectedTickers.length}/6)
          </h3>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedTickers.map((ticker, idx) => (
              <motion.div
                key={ticker}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-electric-blue/30"
              >
                <span className="font-mono font-bold text-white">{ticker}</span>
                <button
                  onClick={() => handleRemoveTicker(ticker)}
                  className="text-loss-red hover:text-loss-red/80 transition-colors"
                >
                  ×
                </button>
              </motion.div>
            ))}

            {selectedTickers.length < 6 && (
              <button
                onClick={() => setIsAddingTicker(!isAddingTicker)}
                className="px-4 py-2 glass rounded-lg border border-profit-green/30 text-profit-green hover:bg-profit-green/10 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Ticker
              </button>
            )}
          </div>

          {isAddingTicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tickers..."
                className="w-full px-4 py-3 rounded-lg glass border border-electric-blue/30 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue mb-2"
                autoFocus
              />
              {searchTerm && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filteredTickers.slice(0, 8).map((ticker) => (
                    <button
                      key={ticker}
                      onClick={() => handleAddTicker(ticker)}
                      className="w-full px-4 py-2 text-left rounded-lg glass hover:bg-electric-blue/10 transition-colors"
                    >
                      <span className="font-mono text-electric-blue">{ticker}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Watchlist - 1 column */}
          <div className="lg:col-span-1">
            <Watchlist
              onSelectTicker={handleWatchlistSelect}
              availableTickers={availableTickers}
            />
          </div>

          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Ticker Comparison */}
            {comparisonData.length > 0 && !loading && (
              <MultiTickerComparison data={comparisonData} />
            )}

            {loading && (
              <div className="glass-strong rounded-xl p-12 text-center border border-electric-blue/30">
                <Loader2 className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading comparison data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Optimizer */}
        {!loading && comparisonData.length > 0 && (
          <PortfolioOptimizer tickers={selectedTickers} />
        )}

        {/* Batch Analysis */}
        {!loading && comparisonData.length > 0 && (
          <BatchAnalysis
            results={comparisonData.map(item => ({
              ticker: item.ticker,
              regime: item.regime_prediction.predicted_regime_21d,
              confidence: item.regime_prediction.confidence,
              sharpe_ratio: item.risk_metrics.sharpe_ratio,
              max_drawdown: item.risk_metrics.max_drawdown,
              expected_return: item.risk_metrics.expected_return,
              recommendation: item.strategy_recommendation.recommendation.primary_strategy,
              risk_score: item.regime_prediction.predicted_regime_21d === 'HIGH_VOL' ? 80 :
                         item.regime_prediction.predicted_regime_21d === 'NORMAL_VOL' ? 50 : 20,
            }))}
          />
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 text-sm py-8"
        >
          <p>Portfolio optimization powered by modern portfolio theory</p>
          <p className="mt-2">Phase 3 - Complete ✓</p>
        </motion.div>
      </div>
    </div>
  );
}
