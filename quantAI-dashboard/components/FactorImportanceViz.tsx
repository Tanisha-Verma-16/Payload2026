'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Award, Info } from 'lucide-react';

interface FactorImportanceProps {
  data: {
    top_features: Array<{
      feature: string;
      importance: number;
    }>;
  };
}

export default function FactorImportanceViz({ data }: FactorImportanceProps) {
  // Sort by importance and take top 15
  const topFeatures = data.top_features
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 15)
    .map((item) => ({
      name: formatFeatureName(item.feature),
      fullName: item.feature,
      importance: item.importance,
    }));

  // Color scale from most to least important
  const getBarColor = (index: number) => {
    const colors = [
      '#ffd700', // Gold
      '#00d4ff', // Electric Blue
      '#00fff5', // Cyber Cyan
      '#b24bf3', // Neon Purple
      '#00ff88', // Profit Green
    ];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-xl p-6 border border-gold-accent/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-gold-accent" />
            <h3 className="text-lg font-bold font-display text-gold-accent">
              Factor Importance
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            Top predictive features for regime classification
          </p>
        </div>
        <div className="glass rounded-lg px-3 py-1 border border-gold-accent/30">
          <span className="text-xs text-gold-accent font-semibold">
            Top {topFeatures.length} Features
          </span>
        </div>
      </div>

      {/* Top 3 Medals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {topFeatures.slice(0, 3).map((feature, index) => (
          <motion.div
            key={feature.fullName}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`glass rounded-lg p-4 border ${
              index === 0 ? 'border-gold-accent/50' :
              index === 1 ? 'border-electric-blue/50' :
              'border-warning-orange/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`text-2xl ${
                index === 0 ? 'text-gold-accent' :
                index === 1 ? 'text-electric-blue' :
                'text-warning-orange'
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              <div className="text-xs text-gray-400">#{index + 1}</div>
            </div>
            <div className="text-sm font-semibold text-white truncate" title={feature.name}>
              {feature.name}
            </div>
            <div className={`text-lg font-bold ${
              index === 0 ? 'text-gold-accent' :
              index === 1 ? 'text-electric-blue' :
              'text-warning-orange'
            }`}>
              {feature.importance.toFixed(1)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="mb-6">
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topFeatures}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" horizontal={false} />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Importance Score', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 38, 66, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#00d4ff', marginBottom: '8px' }}
                formatter={(value: number, name: string, props: any) => [
                  value.toFixed(2),
                  props.payload.fullName
                ]}
              />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                {topFeatures.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Categories */}
      <div className="border-t border-slate-dark pt-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4" />
          Feature Categories
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass rounded-lg p-3 border border-electric-blue/20">
            <div className="text-xs text-electric-blue font-semibold mb-1">PRICE MOMENTUM</div>
            <div className="text-xs text-gray-400">
              Z-scores (50d, 200d), momentum periods (1m, 3m, 12m)
            </div>
          </div>
          <div className="glass rounded-lg p-3 border border-neon-purple/20">
            <div className="text-xs text-neon-purple font-semibold mb-1">VOLATILITY</div>
            <div className="text-xs text-gray-400">
              Vol 20d/60d, ATR, vol trend, z-score vol
            </div>
          </div>
          <div className="glass rounded-lg p-3 border border-profit-green/20">
            <div className="text-xs text-profit-green font-semibold mb-1">TECHNICAL INDICATORS</div>
            <div className="text-xs text-gray-400">
              RSI, MACD, Bollinger Bands (upper/lower/width)
            </div>
          </div>
          <div className="glass rounded-lg p-3 border border-warning-orange/20">
            <div className="text-xs text-warning-orange font-semibold mb-1">VOLUME</div>
            <div className="text-xs text-gray-400">
              Volume std deviation, relative volume
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-slate-dark/30 rounded-lg border border-gold-accent/20">
        <h5 className="text-sm font-semibold text-gold-accent mb-2">💡 What This Means</h5>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Higher importance = stronger predictive power for volatility regime changes</li>
          <li>• Price z-scores track how far current price deviates from historical averages</li>
          <li>• Model uses these features to classify market as LOW/NORMAL/HIGH volatility</li>
          <li>• Top features drive the regime predictions you see in the dashboard</li>
        </ul>
      </div>
    </motion.div>
  );
}

// Helper function to format feature names for display
function formatFeatureName(feature: string): string {
  const nameMap: Record<string, string> = {
    'price_zscore_50d_z': 'Price Z-Score 50d',
    'price_zscore_200d': 'Price Z-Score 200d',
    'volume_std': 'Volume Std Dev',
    'rsi_14': 'RSI (14-day)',
    'bb_lower': 'Bollinger Lower',
    'macd_signal': 'MACD Signal',
    'vol_trend': 'Volatility Trend',
    'mom_12_1': 'Momentum 12-1',
    'mom_12m': 'Momentum 12-month',
    'bb_upper': 'Bollinger Upper',
    'mom_3m': 'Momentum 3-month',
    'macd': 'MACD',
    'atr_14': 'ATR (14-day)',
    'bb_middle': 'Bollinger Middle',
    'vol_60d': 'Volatility 60d',
    'z_vol': 'Z-Score Vol',
    'bb_width': 'Bollinger Width',
    'rsi_mean_rev': 'RSI Mean Reversion',
    'price_zscore_50d': 'Price Z-Score 50d',
    'mom_1m': 'Momentum 1-month',
  };

  return nameMap[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
