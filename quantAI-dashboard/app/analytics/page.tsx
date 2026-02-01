'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import MonteCarloViz from '@/components/MonteCarloViz';
import AlphaSignalsViz from '@/components/AlphaSignalsViz';
import FactorImportanceViz from '@/components/FactorImportanceViz';
import CorrelationMatrix from '@/components/CorrelationMatrix';
import TickerSearch from '@/components/TickerSearch';

export default function AdvancedAnalytics() {
  const [selectedTicker, setSelectedTicker] = useState('GOOGL');
  const [tickers, setTickers] = useState<string[]>([]);
  const [assetClasses, setAssetClasses] = useState<Record<string, string>>({});
  const [monteCarloData, setMonteCarloData] = useState<any>(null);
  const [alphaData, setAlphaData] = useState<any>(null);
  const [factorData, setFactorData] = useState<any>(null);
  const [correlationData, setCorrelationData] = useState<any>(null);
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

  // Load analytics data when ticker changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load all data in parallel
        const [monteCarlo, alpha, factor, correlation] = await Promise.all([
          api.getMonteCarloResults(),
          api.getAlphaSignals(selectedTicker, 50),
          api.getFactorImportance(),
          api.getCorrelations([selectedTicker, 'SPY', 'QQQ']),
        ]);

        setMonteCarloData(monteCarlo);
        setAlphaData(alpha);
        setFactorData(factor);
        setCorrelationData(correlation);
      } catch (err) {
        setError('Failed to load advanced analytics data');
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTicker) {
      loadData();
    }
  }, [selectedTicker]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-electric-blue font-semibold text-lg">
            Loading Advanced Analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-strong rounded-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-loss-red mb-4">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2 bg-electric-blue hover:bg-cyber-cyan text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
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
            <span className="neon-text">Advanced</span>
            <span className="gold-text"> Analytics</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Deep-dive quantitative analysis for {selectedTicker}
          </p>
        </motion.div>

        {/* Ticker Search */}
        <div className="flex justify-center">
          <TickerSearch
            tickers={tickers}
            assetClasses={assetClasses}
            onSelect={setSelectedTicker}
            selectedTicker={selectedTicker}
          />
        </div>

        {/* Monte Carlo Simulation */}
        {monteCarloData && (
          <MonteCarloViz data={monteCarloData} />
        )}

        {/* Alpha Signals */}
        {alphaData && (
          <AlphaSignalsViz data={alphaData} />
        )}

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Factor Importance */}
          {factorData && (
            <FactorImportanceViz data={factorData} />
          )}

          {/* Correlation Matrix */}
          {correlationData && (
            <CorrelationMatrix data={correlationData} />
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 text-sm py-8"
        >
          <p>Advanced analytics powered by machine learning models</p>
          <p className="mt-2">Phase 2 - Complete ✓</p>
        </motion.div>
      </div>
    </div>
  );
}