'use client';

import { motion } from 'framer-motion';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Target, Zap, Shield } from 'lucide-react';
import { useState } from 'react';

interface PortfolioOptimizerProps {
  tickers: string[];
}

export default function PortfolioOptimizer({ tickers }: PortfolioOptimizerProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<'aggressive' | 'balanced' | 'conservative'>('balanced');

  // Generate mock efficient frontier data
  // In production, this would come from backend optimization
  const efficientFrontier = generateEfficientFrontier();
  const individualAssets = generateAssetPoints(tickers);
  const optimalPortfolios = getOptimalPortfolios(efficientFrontier);

  const currentPortfolio = optimalPortfolios[selectedStrategy];

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
            <Target className="w-6 h-6 text-neon-purple" />
            <h3 className="text-lg font-bold font-display text-neon-purple">
              Portfolio Optimizer
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            Efficient frontier analysis for {tickers.length} assets
          </p>
        </div>
      </div>

      {/* Strategy Selector */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setSelectedStrategy('aggressive')}
          className={cn(
            'p-4 rounded-lg border-2 transition-all',
            selectedStrategy === 'aggressive'
              ? 'border-profit-green bg-profit-green/10'
              : 'border-slate-dark hover:border-profit-green/50'
          )}
        >
          <Zap className={cn(
            'w-6 h-6 mx-auto mb-2',
            selectedStrategy === 'aggressive' ? 'text-profit-green' : 'text-gray-500'
          )} />
          <div className={cn(
            'text-sm font-semibold',
            selectedStrategy === 'aggressive' ? 'text-profit-green' : 'text-gray-400'
          )}>
            Aggressive
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Max Returns
          </div>
        </button>

        <button
          onClick={() => setSelectedStrategy('balanced')}
          className={cn(
            'p-4 rounded-lg border-2 transition-all',
            selectedStrategy === 'balanced'
              ? 'border-electric-blue bg-electric-blue/10'
              : 'border-slate-dark hover:border-electric-blue/50'
          )}
        >
          <Target className={cn(
            'w-6 h-6 mx-auto mb-2',
            selectedStrategy === 'balanced' ? 'text-electric-blue' : 'text-gray-500'
          )} />
          <div className={cn(
            'text-sm font-semibold',
            selectedStrategy === 'balanced' ? 'text-electric-blue' : 'text-gray-400'
          )}>
            Balanced
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Best Sharpe
          </div>
        </button>

        <button
          onClick={() => setSelectedStrategy('conservative')}
          className={cn(
            'p-4 rounded-lg border-2 transition-all',
            selectedStrategy === 'conservative'
              ? 'border-warning-orange bg-warning-orange/10'
              : 'border-slate-dark hover:border-warning-orange/50'
          )}
        >
          <Shield className={cn(
            'w-6 h-6 mx-auto mb-2',
            selectedStrategy === 'conservative' ? 'text-warning-orange' : 'text-gray-500'
          )} />
          <div className={cn(
            'text-sm font-semibold',
            selectedStrategy === 'conservative' ? 'text-warning-orange' : 'text-gray-400'
          )}>
            Conservative
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Min Risk
          </div>
        </button>
      </div>

      {/* Efficient Frontier Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Risk-Return Tradeoff
        </h4>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f1936" />
              <XAxis
                type="number"
                dataKey="risk"
                name="Risk (Volatility)"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Risk (Volatility %)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
              />
              <YAxis
                type="number"
                dataKey="return"
                name="Expected Return"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Expected Return %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <ZAxis range={[50, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 25, 54, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}%`,
                  name === 'risk' ? 'Risk' : name === 'return' ? 'Return' : name
                ]}
              />
              <Legend />

              {/* Efficient Frontier */}
              <Scatter
                name="Efficient Frontier"
                data={efficientFrontier}
                fill="#b24bf3"
                line={{ stroke: '#b24bf3', strokeWidth: 2 }}
                shape="circle"
              />

              {/* Individual Assets */}
              <Scatter
                name="Individual Assets"
                data={individualAssets}
                fill="#64748b"
                shape="diamond"
              />

              {/* Optimal Portfolio */}
              <Scatter
                name={`${selectedStrategy.charAt(0).toUpperCase() + selectedStrategy.slice(1)} Portfolio`}
                data={[currentPortfolio]}
                fill={
                  selectedStrategy === 'aggressive' ? '#00ff88' :
                  selectedStrategy === 'balanced' ? '#00d4ff' :
                  '#ff8c42'
                }
                shape="star"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portfolio Allocation */}
      <div className="border-t border-slate-dark pt-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
          Recommended Allocation - {selectedStrategy.charAt(0).toUpperCase() + selectedStrategy.slice(1)}
        </h4>
        
        <div className="space-y-3 mb-6">
          {currentPortfolio.allocation.map((item, idx) => (
            <motion.div
              key={item.ticker}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-semibold text-white">
                  {item.ticker}
                </span>
                <span className="text-sm font-bold text-electric-blue">
                  {item.weight.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-dark/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.weight}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className="h-full bg-gradient-to-r from-electric-blue to-neon-purple rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-lg p-3 border border-electric-blue/20">
            <div className="text-xs text-gray-400 mb-1">Expected Return</div>
            <div className="text-lg font-bold text-profit-green">
              {currentPortfolio.return.toFixed(2)}%
            </div>
          </div>
          <div className="glass rounded-lg p-3 border border-warning-orange/20">
            <div className="text-xs text-gray-400 mb-1">Risk (Volatility)</div>
            <div className="text-lg font-bold text-warning-orange">
              {currentPortfolio.risk.toFixed(2)}%
            </div>
          </div>
          <div className="glass rounded-lg p-3 border border-neon-purple/20">
            <div className="text-xs text-gray-400 mb-1">Sharpe Ratio</div>
            <div className="text-lg font-bold text-neon-purple">
              {currentPortfolio.sharpe.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-slate-dark/30 rounded-lg border border-neon-purple/20">
        <h5 className="text-sm font-semibold text-neon-purple mb-2">💡 Understanding the Chart</h5>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• <span className="text-neon-purple">Purple curve</span> = Efficient frontier (best risk-return combinations)</li>
          <li>• <span className="text-gray-400">Gray diamonds</span> = Individual assets (less efficient)</li>
          <li>• <span className="text-electric-blue">Colored star</span> = Your optimal portfolio based on strategy</li>
          <li>• Higher Sharpe Ratio = Better risk-adjusted returns (balanced strategy)</li>
        </ul>
      </div>
    </motion.div>
  );
}

// Helper functions to generate optimization data
function generateEfficientFrontier(): Array<{ risk: number; return: number }> {
  const points: Array<{ risk: number; return: number }> = [];
  for (let risk = 8; risk <= 30; risk += 0.5) {
    const baseReturn = Math.sqrt(risk) * 3;
    const finalReturn = baseReturn + (Math.random() - 0.5) * 2;
    points.push({ risk, return: finalReturn });
  }
  return points.sort((a, b) => a.risk - b.risk);
}

function generateAssetPoints(tickers: string[]): Array<{ risk: number; return: number; name: string }> {
  return tickers.map(ticker => ({
    risk: 10 + Math.random() * 25,
    return: 5 + Math.random() * 20,
    name: ticker,
  }));
}

function getOptimalPortfolios(frontier: Array<{ risk: number; return: number }>) {
  return {
    aggressive: {
      risk: 28,
      return: 22,
      sharpe: 0.79,
      allocation: [
        { ticker: 'NVDA', weight: 35 },
        { ticker: 'TSLA', weight: 25 },
        { ticker: 'GOOGL', weight: 20 },
        { ticker: 'QQQ', weight: 20 },
      ],
    },
    balanced: {
      risk: 18,
      return: 16,
      sharpe: 0.89,
      allocation: [
        { ticker: 'SPY', weight: 30 },
        { ticker: 'QQQ', weight: 25 },
        { ticker: 'GOOGL', weight: 20 },
        { ticker: 'AAPL', weight: 15 },
        { ticker: 'MSFT', weight: 10 },
      ],
    },
    conservative: {
      risk: 10,
      return: 10,
      sharpe: 1.0,
      allocation: [
        { ticker: 'SPY', weight: 40 },
        { ticker: 'TLT', weight: 30 },
        { ticker: 'GLD', weight: 20 },
        { ticker: 'VTI', weight: 10 },
      ],
    },
  };
}

// Import cn utility
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
