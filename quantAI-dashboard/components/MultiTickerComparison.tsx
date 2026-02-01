'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, GitCompare } from 'lucide-react';
import { formatDate, formatPercentage } from '@/lib/utils';

interface MultiTickerComparisonProps {
  data: Array<{
    ticker: string;
    market_data: {
      data: Array<{
        Date: string;
        Close: number;
      }>;
    };
    risk_metrics: {
      sharpe_ratio: number;
      max_drawdown: number;
      expected_return: number;
    };
    regime_prediction: {
      predicted_regime_21d: string;
      confidence: number;
    };
  }>;
}

const TICKER_COLORS = [
  '#00d4ff', // Electric Blue
  '#00ff88', // Profit Green
  '#ffd700', // Gold
  '#b24bf3', // Neon Purple
  '#ff8c42', // Orange
  '#00fff5', // Cyber Cyan
];

export default function MultiTickerComparison({ data }: MultiTickerComparisonProps) {
  // Normalize prices to percentage change from start
  const normalizedData = normalizeToPercentageChange(data);

  // Calculate performance metrics
  const performanceMetrics = data.map((item, idx) => {
    const prices = item.market_data.data.map(d => d.Close);
    const startPrice = prices[prices.length - 1];
    const endPrice = prices[0];
    const totalReturn = ((endPrice - startPrice) / startPrice) * 100;

    return {
      ticker: item.ticker,
      totalReturn,
      sharpeRatio: item.risk_metrics.sharpe_ratio,
      maxDrawdown: item.risk_metrics.max_drawdown,
      expectedReturn: item.risk_metrics.expected_return,
      regime: item.regime_prediction.predicted_regime_21d,
      confidence: item.regime_prediction.confidence,
      color: TICKER_COLORS[idx % TICKER_COLORS.length],
    };
  });

  // Sort by total return
  const sortedByReturn = [...performanceMetrics].sort((a, b) => b.totalReturn - a.totalReturn);
  const sortedBySharpe = [...performanceMetrics].sort((a, b) => b.sharpeRatio - a.sharpeRatio);

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
            <GitCompare className="w-6 h-6 text-electric-blue" />
            <h3 className="text-lg font-bold font-display text-electric-blue">
              Multi-Ticker Comparison
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            Comparative analysis of {data.length} assets
          </p>
        </div>
      </div>

      {/* Normalized Price Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Normalized Performance (% Change)
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={normalizedData}>
              <defs>
                {performanceMetrics.map((metric, idx) => (
                  <linearGradient key={metric.ticker} id={`gradient-${metric.ticker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f1936" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 25, 54, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {performanceMetrics.map((metric, idx) => (
                <Area
                  key={metric.ticker}
                  type="monotone"
                  dataKey={metric.ticker}
                  stroke={metric.color}
                  strokeWidth={2}
                  fill={`url(#gradient-${metric.ticker})`}
                  name={metric.ticker}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Total Return */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ranked by Total Return
          </h4>
          <div className="space-y-2">
            {sortedByReturn.map((metric, idx) => (
              <motion.div
                key={metric.ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-lg p-3 border border-slate-dark/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: metric.color }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-white">
                        {metric.ticker}
                      </div>
                      <div className="text-xs text-gray-400">
                        {metric.regime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      metric.totalReturn > 0 ? 'text-profit-green' : 'text-loss-red'
                    }`}>
                      {metric.totalReturn > 0 ? '+' : ''}
                      {metric.totalReturn.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Return
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* By Sharpe Ratio */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ranked by Sharpe Ratio
          </h4>
          <div className="space-y-2">
            {sortedBySharpe.map((metric, idx) => (
              <motion.div
                key={metric.ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-lg p-3 border border-slate-dark/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: metric.color }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-white">
                        {metric.ticker}
                      </div>
                      <div className="text-xs text-gray-400">
                        Risk-Adjusted
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-electric-blue">
                      {metric.sharpeRatio.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Sharpe
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-6 overflow-x-auto">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Detailed Metrics
        </h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-dark">
              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Ticker</th>
              <th className="text-right py-2 px-3 text-gray-400 font-semibold">Return</th>
              <th className="text-right py-2 px-3 text-gray-400 font-semibold">Sharpe</th>
              <th className="text-right py-2 px-3 text-gray-400 font-semibold">Max DD</th>
              <th className="text-right py-2 px-3 text-gray-400 font-semibold">Exp. Return</th>
              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Regime</th>
            </tr>
          </thead>
          <tbody>
            {performanceMetrics.map((metric, idx) => (
              <motion.tr
                key={metric.ticker}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-slate-dark/30 hover:bg-slate-dark/20"
              >
                <td className="py-3 px-3">
                  <span className="font-mono font-bold" style={{ color: metric.color }}>
                    {metric.ticker}
                  </span>
                </td>
                <td className={`py-3 px-3 text-right font-semibold ${
                  metric.totalReturn > 0 ? 'text-profit-green' : 'text-loss-red'
                }`}>
                  {metric.totalReturn > 0 ? '+' : ''}{metric.totalReturn.toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-right text-electric-blue font-semibold">
                  {metric.sharpeRatio.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-warning-orange font-semibold">
                  {metric.maxDrawdown.toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-right text-profit-green font-semibold">
                  {metric.expectedReturn.toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-xs">
                  <span className="px-2 py-1 rounded bg-slate-dark text-gray-300">
                    {metric.regime}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-slate-dark/30 rounded-lg border border-electric-blue/20">
        <h5 className="text-sm font-semibold text-electric-blue mb-2">💡 Quick Insights</h5>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• <span className="text-profit-green">Best Return</span>: {sortedByReturn[0].ticker} at {sortedByReturn[0].totalReturn.toFixed(2)}%</li>
          <li>• <span className="text-electric-blue">Best Sharpe</span>: {sortedBySharpe[0].ticker} at {sortedBySharpe[0].sharpeRatio.toFixed(2)} (best risk-adjusted)</li>
          <li>• <span className="text-warning-orange">Lower drawdown</span> = less volatility = smoother ride</li>
          <li>• Use this to diversify: pick assets with different regimes and low correlation</li>
        </ul>
      </div>
    </motion.div>
  );
}

// Helper function to normalize prices to percentage change
function normalizeToPercentageChange(
  data: MultiTickerComparisonProps['data']
): any[] {
  const allDates = new Set<string>();
  
  // Collect all unique dates
  data.forEach(item => {
    item.market_data.data.forEach(d => {
      allDates.add(d.Date);
    });
  });

  const sortedDates = Array.from(allDates).sort();

  return sortedDates.map(date => {
    const dataPoint: any = { date: formatDate(date) };

    data.forEach(item => {
      const priceData = item.market_data.data.find(d => d.Date === date);
      if (priceData) {
        const startPrice = item.market_data.data[item.market_data.data.length - 1].Close;
        const percentChange = ((priceData.Close - startPrice) / startPrice) * 100;
        dataPoint[item.ticker] = percentChange;
      }
    });

    return dataPoint;
  }).reverse();
}
