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
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PriceChartProps {
  data: Array<{
    Date: string;
    Close: number;
    High: number;
    Low: number;
  }>;
  ticker: string;
}

export default function PriceChart({ data, ticker }: PriceChartProps) {
  const chartData = data
    .slice()
    .reverse()
    .map((d) => ({
      date: formatDate(d.Date),
      close: d.Close,
      high: d.High,
      low: d.Low,
    }));

  const minPrice = Math.min(...chartData.map((d) => d.low));
  const maxPrice = Math.max(...chartData.map((d) => d.high));
  const priceChange = chartData[chartData.length - 1].close - chartData[0].close;
  const priceChangePercent = (priceChange / chartData[0].close) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-strong rounded-xl p-6 border border-electric-blue/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
            Price Chart
          </h3>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold font-display text-white">
              {formatCurrency(chartData[chartData.length - 1].close)}
            </span>
            <span
              className={`text-lg font-semibold ${
                priceChange >= 0 ? 'text-profit-green' : 'text-loss-red'
              }`}
            >
              {priceChange >= 0 ? '+' : ''}
              {formatCurrency(priceChange)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Period</div>
          <div className="text-lg font-semibold text-electric-blue">
            {chartData.length} days
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={priceChange >= 0 ? '#00ff88' : '#ff3366'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={priceChange >= 0 ? '#00ff88' : '#ff3366'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              domain={[minPrice * 0.98, maxPrice * 1.02]}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 38, 66, 0.95)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#00d4ff' }}
              formatter={(value: number) => [formatCurrency(value), 'Price']}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={priceChange >= 0 ? '#00ff88' : '#ff3366'}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-dark">
        <div>
          <div className="text-xs text-gray-400 mb-1">High</div>
          <div className="text-lg font-semibold text-profit-green">
            {formatCurrency(maxPrice)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Low</div>
          <div className="text-lg font-semibold text-loss-red">
            {formatCurrency(minPrice)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Current</div>
          <div className="text-lg font-semibold text-electric-blue">
            {formatCurrency(chartData[chartData.length - 1].close)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
