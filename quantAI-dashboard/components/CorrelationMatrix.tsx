'use client';

import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import { useState } from 'react';

interface CorrelationMatrixProps {
  data: {
    tickers: string[];
    correlation_matrix: Record<string, Record<string, number>>;
  };
}

export default function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<{ticker1: string, ticker2: string} | null>(null);
  
  const { tickers, correlation_matrix } = data;

  // Get color based on correlation value
  const getCorrelationColor = (value: number): string => {
    if (value === 1) return 'rgb(100, 116, 139)'; // Diagonal (self-correlation)
    
    const absValue = Math.abs(value);
    
    if (value > 0) {
      // Positive correlation - green scale
      const intensity = Math.round(255 * (1 - absValue));
      return `rgb(${intensity}, 255, ${intensity})`;
    } else {
      // Negative correlation - red scale
      const intensity = Math.round(255 * (1 - absValue));
      return `rgb(255, ${intensity}, ${intensity})`;
    }
  };

  // Get text color for readability
  const getTextColor = (value: number): string => {
    const absValue = Math.abs(value);
    return absValue > 0.5 ? '#000' : '#fff';
  };

  const cellSize = 80; // Size of each cell in pixels

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
            <Network className="w-6 h-6 text-electric-blue" />
            <h3 className="text-lg font-bold font-display text-electric-blue">
              Correlation Matrix
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            Pearson correlation between {tickers.length} assets
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgb(255, 100, 100)' }}></div>
          <span className="text-xs text-gray-400">-1.0 (Negative)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-dark"></div>
          <span className="text-xs text-gray-400">0.0 (No Correlation)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgb(100, 255, 100)' }}></div>
          <span className="text-xs text-gray-400">+1.0 (Positive)</span>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-xs font-semibold text-gray-400 sticky left-0 bg-midnight z-10">
                  Asset
                </th>
                {tickers.map((ticker) => (
                  <th
                    key={ticker}
                    className="p-2 text-xs font-semibold text-electric-blue font-mono"
                    style={{ width: `${cellSize}px` }}
                  >
                    {ticker}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickers.map((ticker1, i) => (
                <motion.tr
                  key={ticker1}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="p-2 text-xs font-semibold text-electric-blue font-mono sticky left-0 bg-midnight z-10">
                    {ticker1}
                  </td>
                  {tickers.map((ticker2, j) => {
                    const value = correlation_matrix[ticker1][ticker2];
                    const isHovered = hoveredCell?.ticker1 === ticker1 && hoveredCell?.ticker2 === ticker2;
                    
                    return (
                      <motion.td
                        key={`${ticker1}-${ticker2}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (i + j) * 0.02 }}
                        className="relative cursor-pointer transition-transform"
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          backgroundColor: getCorrelationColor(value),
                          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                          zIndex: isHovered ? 20 : 1,
                        }}
                        onMouseEnter={() => setHoveredCell({ ticker1, ticker2 })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div
                          className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono"
                          style={{ color: getTextColor(value) }}
                        >
                          {value.toFixed(2)}
                        </div>
                        
                        {/* Hover tooltip */}
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-16 left-1/2 -translate-x-1/2 glass-strong p-3 rounded-lg border border-electric-blue/50 whitespace-nowrap shadow-2xl z-50"
                          >
                            <div className="text-xs text-white font-semibold mb-1">
                              {ticker1} ↔ {ticker2}
                            </div>
                            <div className="text-sm font-bold text-electric-blue">
                              Correlation: {value.toFixed(4)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {value > 0.7 ? 'Strong Positive' :
                               value > 0.3 ? 'Moderate Positive' :
                               value > -0.3 ? 'Weak/No Correlation' :
                               value > -0.7 ? 'Moderate Negative' :
                               'Strong Negative'}
                            </div>
                          </motion.div>
                        )}
                      </motion.td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="mt-6 p-4 bg-slate-dark/30 rounded-lg border border-electric-blue/20">
        <h5 className="text-sm font-semibold text-electric-blue mb-3">💡 How to Read This</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-400">
          <div>
            <p className="font-semibold text-profit-green mb-1">Positive Correlation (Green)</p>
            <p>Assets move together. When one goes up, the other tends to go up too.</p>
          </div>
          <div>
            <p className="font-semibold text-loss-red mb-1">Negative Correlation (Red)</p>
            <p>Assets move opposite. When one goes up, the other tends to go down.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-300 mb-1">Near Zero (Gray)</p>
            <p>No clear relationship. Assets move independently of each other.</p>
          </div>
          <div>
            <p className="font-semibold text-electric-blue mb-1">Portfolio Application</p>
            <p>Low/negative correlations = better diversification and risk reduction.</p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass rounded-lg p-3 border border-profit-green/30">
          <div className="text-xs text-gray-400 mb-1">Highest Positive</div>
          <div className="text-sm font-bold text-profit-green">
            {findHighestCorrelation(correlation_matrix, tickers, true)}
          </div>
        </div>
        <div className="glass rounded-lg p-3 border border-loss-red/30">
          <div className="text-xs text-gray-400 mb-1">Highest Negative</div>
          <div className="text-sm font-bold text-loss-red">
            {findHighestCorrelation(correlation_matrix, tickers, false)}
          </div>
        </div>
        <div className="glass rounded-lg p-3 border border-electric-blue/30">
          <div className="text-xs text-gray-400 mb-1">Average Correlation</div>
          <div className="text-sm font-bold text-electric-blue">
            {calculateAverageCorrelation(correlation_matrix, tickers)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper functions
function findHighestCorrelation(
  matrix: Record<string, Record<string, number>>,
  tickers: string[],
  positive: boolean
): string {
  let extremeValue = positive ? -Infinity : Infinity;
  let extremePair = '';

  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      const ticker1 = tickers[i];
      const ticker2 = tickers[j];
      const value = matrix[ticker1][ticker2];

      if (positive && value > extremeValue) {
        extremeValue = value;
        extremePair = `${ticker1} & ${ticker2}`;
      } else if (!positive && value < extremeValue) {
        extremeValue = value;
        extremePair = `${ticker1} & ${ticker2}`;
      }
    }
  }

  return `${extremePair}: ${extremeValue.toFixed(3)}`;
}

function calculateAverageCorrelation(
  matrix: Record<string, Record<string, number>>,
  tickers: string[]
): string {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      sum += Math.abs(matrix[tickers[i]][tickers[j]]);
      count++;
    }
  }

  return (sum / count).toFixed(3);
}
