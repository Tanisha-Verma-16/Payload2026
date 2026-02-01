'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AlphaSignalsProps {
  data: {
    ticker: string;
    signals: Array<{
      Date: string;
      alpha_momentum: number;
      alpha_mean_reversion: number;
      alpha_combined: number;
      mom_decile: number;
      vol_regime: string;
      rsi_14: number;
      macd: number;
    }>;
  };
}

export default function AlphaSignalsViz({ data }: AlphaSignalsProps) {
  // Prepare chart data
  const chartData = data.signals
    .slice()
    .reverse()
    .map((signal) => ({
      date: formatDate(signal.Date),
      momentum: signal.alpha_momentum,
      meanReversion: signal.alpha_mean_reversion,
      combined: signal.alpha_combined,
      rsi: signal.rsi_14,
      macd: signal.macd,
    }));

  const latestSignal = data.signals[0];
  const avgMomentum = data.signals.reduce((sum, s) => sum + s.alpha_momentum, 0) / data.signals.length;
  const avgMeanRev = data.signals.reduce((sum, s) => sum + s.alpha_mean_reversion, 0) / data.signals.length;

  // Determine dominant strategy
  const dominantStrategy = latestSignal.alpha_momentum > Math.abs(latestSignal.alpha_mean_reversion)
    ? 'Momentum'
    : 'Mean Reversion';

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
            <Activity className="w-6 h-6 text-electric-blue" />
            <h3 className="text-lg font-bold font-display text-electric-blue">
              Alpha Signals Analysis
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            Factor-based trading signals for {data.ticker}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Dominant Strategy</div>
          <div className={`text-xl font-bold ${
            dominantStrategy === 'Momentum' ? 'text-profit-green' : 'text-warning-orange'
          }`}>
            {dominantStrategy}
          </div>
        </div>
      </div>

      {/* Current Signal Strength */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-lg p-4 border border-profit-green/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-profit-green" />
            <div className="text-xs text-gray-400">Momentum Signal</div>
          </div>
          <div className="text-2xl font-bold text-profit-green">
            {latestSignal.alpha_momentum.toFixed(3)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Avg: {avgMomentum.toFixed(3)}
          </div>
        </div>

        <div className="glass rounded-lg p-4 border border-warning-orange/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-warning-orange" />
            <div className="text-xs text-gray-400">Mean Reversion</div>
          </div>
          <div className="text-2xl font-bold text-warning-orange">
            {latestSignal.alpha_mean_reversion.toFixed(3)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Avg: {avgMeanRev.toFixed(3)}
          </div>
        </div>

        <div className="glass rounded-lg p-4 border border-electric-blue/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-electric-blue" />
            <div className="text-xs text-gray-400">Combined Alpha</div>
          </div>
          <div className="text-2xl font-bold text-electric-blue">
            {latestSignal.alpha_combined.toFixed(3)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Momentum Decile: {latestSignal.mom_decile}
          </div>
        </div>
      </div>

      {/* Alpha Signals Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Signal Evolution
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="meanRevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8c42" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff8c42" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ 
                  value: 'Alpha Signal', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: '#94a3b8' 
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 38, 66, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#00d4ff', marginBottom: '8px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <ReferenceLine yAxisId="left" y={0} stroke="#64748b" strokeDasharray="3 3" />
              
              {/* Momentum line with area */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="momentum"
                stroke="#00ff88"
                strokeWidth={2}
                dot={false}
                name="Momentum Alpha"
                fill="url(#momentumGradient)"
              />
              
              {/* Mean Reversion line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="meanReversion"
                stroke="#ff8c42"
                strokeWidth={2}
                dot={false}
                name="Mean Reversion Alpha"
              />
              
              {/* Combined signal */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="combined"
                stroke="#00d4ff"
                strokeWidth={3}
                dot={false}
                name="Combined Signal"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RSI and MACD Technical Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSI Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            RSI (14-Day)
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 38, 66, 0.95)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                  }}
                />
                <ReferenceLine y={70} stroke="#ff3366" strokeDasharray="3 3" label={{ value: 'Overbought', fill: '#ff3366', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#00ff88" strokeDasharray="3 3" label={{ value: 'Oversold', fill: '#00ff88', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#b24bf3"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm text-gray-400">Current RSI: </span>
            <span className={`text-lg font-bold ${
              latestSignal.rsi_14 > 70 ? 'text-loss-red' : 
              latestSignal.rsi_14 < 30 ? 'text-profit-green' : 
              'text-electric-blue'
            }`}>
              {latestSignal.rsi_14.toFixed(1)}
            </span>
          </div>
        </div>

        {/* MACD Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            MACD Signal
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 38, 66, 0.95)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                  }}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                <Bar
                  dataKey="macd"
                  fill="#00d4ff"
                  opacity={0.6}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm text-gray-400">Current MACD: </span>
            <span className={`text-lg font-bold ${
              latestSignal.macd > 0 ? 'text-profit-green' : 'text-loss-red'
            }`}>
              {latestSignal.macd.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="mt-6 p-4 bg-slate-dark/30 rounded-lg border border-electric-blue/20">
        <h5 className="text-sm font-semibold text-electric-blue mb-2">💡 Signal Interpretation</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
          <div>
            <p className="font-semibold text-profit-green mb-1">Momentum Alpha (+)</p>
            <p>Trend is your friend. Price moving in one direction. Good for trend-following strategies.</p>
          </div>
          <div>
            <p className="font-semibold text-warning-orange mb-1">Mean Reversion Alpha (-)</p>
            <p>Price stretched from average. Good for contrarian strategies betting on reversion.</p>
          </div>
          <div>
            <p className="font-semibold text-electric-blue mb-1">Combined Signal</p>
            <p>Weighted combination. Positive = bullish bias, Negative = bearish bias.</p>
          </div>
          <div>
            <p className="font-semibold text-neon-purple mb-1">RSI & MACD</p>
            <p>RSI {'>'}70 = overbought, {'<'}30 = oversold. MACD {'>'}0 = uptrend momentum.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
