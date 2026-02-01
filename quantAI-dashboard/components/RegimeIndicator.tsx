'use client';

import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun } from 'lucide-react';
import { cn, getRegimeColor, getRegimeLabel } from '@/lib/utils';

interface RegimeIndicatorProps {
  regime: string;
  confidence: number;
  probabilities?: {
    LOW_VOL: number;
    NORMAL_VOL: number;
    HIGH_VOL: number;
  };
}

export default function RegimeIndicator({
  regime,
  confidence,
  probabilities,
}: RegimeIndicatorProps) {
  const getRegimeIcon = () => {
    switch (regime) {
      case 'LOW_VOL':
        return Sun;
      case 'NORMAL_VOL':
        return Cloud;
      case 'HIGH_VOL':
        return CloudRain;
      default:
        return Cloud;
    }
  };

  const Icon = getRegimeIcon();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-xl p-8 border border-electric-blue/20"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
          Market Regime
        </h3>
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: regime === 'HIGH_VOL' ? [0, -10, 10, 0] : 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className={cn('w-12 h-12', getRegimeColor(regime))} />
          </motion.div>
        </div>
        <h2 className={cn('text-2xl font-bold font-display', getRegimeColor(regime))}>
          {getRegimeLabel(regime)}
        </h2>
      </div>

      {/* Confidence Meter */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Confidence</span>
          <span className={cn('font-bold', getRegimeColor(regime))}>
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-slate-dark/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={cn(
              'h-full rounded-full',
              regime === 'LOW_VOL' && 'bg-gradient-to-r from-profit-green to-emerald-400',
              regime === 'NORMAL_VOL' && 'bg-gradient-to-r from-electric-blue to-cyber-cyan',
              regime === 'HIGH_VOL' && 'bg-gradient-to-r from-warning-orange to-red-500'
            )}
          />
        </div>
      </div>

      {/* Probability Distribution */}
      {probabilities && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Probability Distribution
          </h4>
          
          {Object.entries(probabilities).map(([key, value], index) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={cn(
                  'font-medium',
                  key === regime ? getRegimeColor(regime) : 'text-gray-500'
                )}>
                  {getRegimeLabel(key)}
                </span>
                <span className={cn(
                  'font-mono',
                  key === regime ? getRegimeColor(regime) : 'text-gray-500'
                )}>
                  {(value * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-dark/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                  className={cn(
                    'h-full rounded-full opacity-50',
                    key === 'LOW_VOL' && 'bg-profit-green',
                    key === 'NORMAL_VOL' && 'bg-electric-blue',
                    key === 'HIGH_VOL' && 'bg-warning-orange',
                    key === regime && 'opacity-100'
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
