'use client';

import { motion } from 'framer-motion';
import { Database, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatPercentage } from '@/lib/utils';

interface BatchAnalysisProps {
  results: Array<{
    ticker: string;
    regime: string;
    confidence: number;
    sharpe_ratio: number;
    max_drawdown: number;
    expected_return: number;
    recommendation: string;
    risk_score: number;
  }>;
}

export default function BatchAnalysis({ results }: BatchAnalysisProps) {
  // Sort by different metrics
  const byReturn = [...results].sort((a, b) => b.expected_return - a.expected_return);
  const bySharpe = [...results].sort((a, b) => b.sharpe_ratio - a.sharpe_ratio);
  const byRisk = [...results].sort((a, b) => a.risk_score - b.risk_score);

  // Get regime distribution
  const regimeCount = results.reduce((acc, r) => {
    acc[r.regime] = (acc[r.regime] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getRegimeColor = (regime: string) => {
    if (regime.includes('LOW')) return 'text-profit-green';
    if (regime.includes('NORMAL')) return 'text-electric-blue';
    return 'text-warning-orange';
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: 'Low', color: 'text-profit-green' };
    if (score < 70) return { label: 'Medium', color: 'text-warning-orange' };
    return { label: 'High', color: 'text-loss-red' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-xl p-6 border border-electric-blue/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-electric-blue" />
            <h3 className="text-lg font-bold font-display text-electric-blue">
              Batch Analysis Results
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            Comprehensive analysis of {results.length} assets
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-lg p-4 border border-electric-blue/20">
          <div className="text-xs text-gray-400 mb-1">Total Analyzed</div>
          <div className="text-2xl font-bold text-electric-blue">
            {results.length}
          </div>
        </div>
        
        <div className="glass rounded-lg p-4 border border-profit-green/20">
          <div className="text-xs text-gray-400 mb-1">Low Volatility</div>
          <div className="text-2xl font-bold text-profit-green">
            {regimeCount['LOW_VOL'] || 0}
          </div>
        </div>

        <div className="glass rounded-lg p-4 border border-warning-orange/20">
          <div className="text-xs text-gray-400 mb-1">High Volatility</div>
          <div className="text-2xl font-bold text-warning-orange">
            {regimeCount['HIGH_VOL'] || 0}
          </div>
        </div>

        <div className="glass rounded-lg p-4 border border-gold-accent/20">
          <div className="text-xs text-gray-400 mb-1">Avg Sharpe Ratio</div>
          <div className="text-2xl font-bold text-gold-accent">
            {(results.reduce((sum, r) => sum + r.sharpe_ratio, 0) / results.length).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top by Return */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-profit-green" />
            Top by Return
          </h4>
          <div className="space-y-2">
            {byReturn.slice(0, 5).map((result, idx) => (
              <motion.div
                key={result.ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass rounded-lg p-3 border border-slate-dark/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-profit-green">
                      #{idx + 1}
                    </span>
                    <span className="font-mono font-bold text-white">
                      {result.ticker}
                    </span>
                  </div>
                  <span className="text-profit-green font-bold">
                    {result.expected_return.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top by Sharpe */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-electric-blue" />
            Best Risk-Adjusted
          </h4>
          <div className="space-y-2">
            {bySharpe.slice(0, 5).map((result, idx) => (
              <motion.div
                key={result.ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass rounded-lg p-3 border border-slate-dark/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-electric-blue">
                      #{idx + 1}
                    </span>
                    <span className="font-mono font-bold text-white">
                      {result.ticker}
                    </span>
                  </div>
                  <span className="text-electric-blue font-bold">
                    {result.sharpe_ratio.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lowest Risk */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-orange" />
            Lowest Risk
          </h4>
          <div className="space-y-2">
            {byRisk.slice(0, 5).map((result, idx) => (
              <motion.div
                key={result.ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass rounded-lg p-3 border border-slate-dark/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-profit-green">
                      #{idx + 1}
                    </span>
                    <span className="font-mono font-bold text-white">
                      {result.ticker}
                    </span>
                  </div>
                  <span className={getRiskLevel(result.risk_score).color + ' font-bold'}>
                    {getRiskLevel(result.risk_score).label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Results Table */}
      <div className="overflow-x-auto">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Complete Results
        </h4>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-midnight z-10">
              <tr className="border-b border-slate-dark">
                <th className="text-left py-3 px-3 text-gray-400 font-semibold">Ticker</th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold">Regime</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold">Confidence</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold">Exp. Return</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold">Sharpe</th>
                <th className="text-right py-3 px-3 text-gray-400 font-semibold">Max DD</th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold">Risk Level</th>
                <th className="text-left py-3 px-3 text-gray-400 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => {
                const riskLevel = getRiskLevel(result.risk_score);
                return (
                  <motion.tr
                    key={result.ticker}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-slate-dark/30 hover:bg-slate-dark/20"
                  >
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-white">
                        {result.ticker}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-1 rounded ${getRegimeColor(result.regime)}`}>
                        {result.regime}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-electric-blue">
                      {(result.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-profit-green">
                      {result.expected_return.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-electric-blue">
                      {result.sharpe_ratio.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-warning-orange">
                      {result.max_drawdown.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold ${riskLevel.color}`}>
                        {riskLevel.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-400">
                      {result.recommendation}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-slate-dark/30 rounded-lg border border-electric-blue/20">
        <h5 className="text-sm font-semibold text-electric-blue mb-2">📊 Quick Insights</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-400">
          <div>
            <span className="text-profit-green font-semibold">Best Return:</span> {byReturn[0].ticker} ({byReturn[0].expected_return.toFixed(1)}%)
          </div>
          <div>
            <span className="text-electric-blue font-semibold">Best Sharpe:</span> {bySharpe[0].ticker} ({bySharpe[0].sharpe_ratio.toFixed(2)})
          </div>
          <div>
            <span className="text-warning-orange font-semibold">Safest:</span> {byRisk[0].ticker} (Low Risk)
          </div>
          <div>
            <span className="text-gold-accent font-semibold">Total Assets:</span> {results.length} analyzed
          </div>
        </div>
      </div>
    </motion.div>
  );
}
