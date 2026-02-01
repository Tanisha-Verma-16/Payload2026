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
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface MonteCarloProps {
  data: {
    simulation_params: {
      initial_value: number;
      horizon_days: number;
      n_simulations: number;
    };
    percentiles: {
      p5: number[];
      p25: number[];
      p50: number[];
      p75: number[];
      p95: number[];
    };
    sample_paths: number[][];
    days: number[];
  };
}

export default function MonteCarloViz({ data }: MonteCarloProps) {
  // Prepare chart data
  const chartData = data.days.map((day, index) => ({
    day,
    p5: data.percentiles.p5[index],
    p25: data.percentiles.p25[index],
    p50: data.percentiles.p50[index],
    p75: data.percentiles.p75[index],
    p95: data.percentiles.p95[index],
  }));

  // Sample 5 random paths for visualization
  const samplePaths = data.sample_paths.slice(0, 5).map((path, idx) => ({
    name: `Path ${idx + 1}`,
    data: data.days.map((day, i) => ({ day, value: path[i] })),
    color: ['#00d4ff', '#00fff5', '#b24bf3', '#ffd700', '#ff8c42'][idx],
  }));

  const finalMedian = data.percentiles.p50[data.percentiles.p50.length - 1];
  const finalP95 = data.percentiles.p95[data.percentiles.p95.length - 1];
  const finalP5 = data.percentiles.p5[data.percentiles.p5.length - 1];
  const returnMedian = ((finalMedian - data.simulation_params.initial_value) / data.simulation_params.initial_value) * 100;
  const returnBest = ((finalP95 - data.simulation_params.initial_value) / data.simulation_params.initial_value) * 100;
  const returnWorst = ((finalP5 - data.simulation_params.initial_value) / data.simulation_params.initial_value) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-xl p-6 border border-neon-purple/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-neon-purple" />
            <h3 className="text-lg font-bold font-display text-neon-purple">
              Monte Carlo Simulation
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            {data.simulation_params.n_simulations.toLocaleString()} simulations over {data.simulation_params.horizon_days} days
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Starting Value</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(data.simulation_params.initial_value)}
          </div>
        </div>
      </div>

      {/* Outcome Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-lg p-4 border border-loss-red/30">
          <div className="text-xs text-gray-400 mb-1">Worst Case (5th %ile)</div>
          <div className="text-xl font-bold text-loss-red">
            {formatCurrency(finalP5)}
          </div>
          <div className="text-sm text-loss-red mt-1">
            {returnWorst.toFixed(1)}% return
          </div>
        </div>

        <div className="glass rounded-lg p-4 border border-electric-blue/30">
          <div className="text-xs text-gray-400 mb-1">Expected (Median)</div>
          <div className="text-xl font-bold text-electric-blue">
            {formatCurrency(finalMedian)}
          </div>
          <div className="text-sm text-electric-blue mt-1">
            {returnMedian.toFixed(1)}% return
          </div>
        </div>

        <div className="glass rounded-lg p-4 border border-profit-green/30">
          <div className="text-xs text-gray-400 mb-1">Best Case (95th %ile)</div>
          <div className="text-xl font-bold text-profit-green">
            {formatCurrency(finalP95)}
          </div>
          <div className="text-sm text-profit-green mt-1">
            {returnBest.toFixed(1)}% return
          </div>
        </div>
      </div>

      {/* Percentile Cone Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Probability Cone
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {/* Gradient for outer cone (5th-95th percentile) */}
                <linearGradient id="cone95" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b24bf3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#b24bf3" stopOpacity={0} />
                </linearGradient>
                {/* Gradient for middle cone (25th-75th percentile) */}
                <linearGradient id="cone75" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Trading Days', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 38, 66, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#00d4ff', marginBottom: '8px' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {/* Outer cone area (5th to 95th percentile) */}
              <Area
                type="monotone"
                dataKey="p95"
                stroke="#b24bf3"
                strokeWidth={2}
                fill="url(#cone95)"
                name="95th Percentile"
              />
              <Area
                type="monotone"
                dataKey="p5"
                stroke="#b24bf3"
                strokeWidth={2}
                fill="transparent"
                name="5th Percentile"
              />
              
              {/* Middle cone area (25th to 75th percentile) */}
              <Area
                type="monotone"
                dataKey="p75"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#cone75)"
                name="75th Percentile"
              />
              <Area
                type="monotone"
                dataKey="p25"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="transparent"
                name="25th Percentile"
              />
              
              {/* Median line */}
              <Line
                type="monotone"
                dataKey="p50"
                stroke="#00fff5"
                strokeWidth={3}
                dot={false}
                name="Median (50th %ile)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sample Paths */}
      <div className="border-t border-slate-dark pt-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Sample Simulation Paths
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 38, 66, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              {samplePaths.map((path, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  data={path.data}
                  dataKey="value"
                  stroke={path.color}
                  strokeWidth={1.5}
                  dot={false}
                  name={path.name}
                  opacity={0.6}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Showing 5 random simulation paths out of {data.simulation_params.n_simulations.toLocaleString()} total simulations
        </p>
      </div>

      {/* Interpretation Guide */}
      <div className="mt-6 p-4 bg-slate-dark/30 rounded-lg border border-electric-blue/20">
        <h5 className="text-sm font-semibold text-electric-blue mb-2">💡 How to Read This</h5>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• <span className="text-neon-purple">Purple band</span>: 90% of outcomes fall within this range (5th-95th percentile)</li>
          <li>• <span className="text-electric-blue">Blue band</span>: 50% of outcomes fall within this range (25th-75th percentile)</li>
          <li>• <span className="text-cyber-cyan">Cyan line</span>: Most likely outcome (median/50th percentile)</li>
          <li>• Wider cone = more uncertainty; Narrower cone = more predictable</li>
        </ul>
      </div>
    </motion.div>
  );
}
