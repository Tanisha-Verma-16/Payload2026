'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gold';
  delay?: number;
}

const colorClasses = {
  blue: 'from-electric-blue/20 to-cyber-cyan/20 border-electric-blue/30',
  green: 'from-profit-green/20 to-emerald-500/20 border-profit-green/30',
  red: 'from-loss-red/20 to-rose-500/20 border-loss-red/30',
  orange: 'from-warning-orange/20 to-amber-500/20 border-warning-orange/30',
  purple: 'from-neon-purple/20 to-purple-500/20 border-neon-purple/30',
  gold: 'from-gold-accent/20 to-yellow-500/20 border-gold-accent/30',
};

const iconColorClasses = {
  blue: 'text-electric-blue',
  green: 'text-profit-green',
  red: 'text-loss-red',
  orange: 'text-warning-orange',
  purple: 'text-neon-purple',
  gold: 'text-gold-accent',
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'glass-strong rounded-xl p-6 card-hover',
        'bg-gradient-to-br',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        {Icon && (
          <Icon className={cn('w-5 h-5', iconColorClasses[color])} />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
            className={cn(
              'text-3xl font-bold font-display',
              iconColorClasses[color]
            )}
          >
            {value}
          </motion.span>

          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend === 'up' && 'text-profit-green',
                trend === 'down' && 'text-loss-red',
                trend === 'neutral' && 'text-gray-400'
              )}
            >
              {trend === 'up' && '↗'}
              {trend === 'down' && '↘'}
              {trend === 'neutral' && '→'}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-gray-400">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
