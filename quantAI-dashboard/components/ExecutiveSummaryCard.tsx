'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutiveSummaryCardProps {
  summary: {
    outlook: string;
    reasoning: string;
    recommendation: string;
    full_summary: string;
  };
  warnings?: string[];
}

export default function ExecutiveSummaryCard({
  summary,
  warnings = [],
}: ExecutiveSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-strong rounded-xl p-6 border border-gold-accent/30 bg-gradient-to-br from-gold-accent/10 to-transparent"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-gold-accent" />
        <h3 className="text-lg font-bold font-display text-gold-accent">
          Executive Summary
        </h3>
      </div>

      {/* AI-Generated Summary */}
      <div className="space-y-4 mb-6">
        {/* Outlook */}
        {summary.outlook && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-electric-blue" />
              <h4 className="text-sm font-semibold text-electric-blue uppercase tracking-wider">
                Market Outlook
              </h4>
            </div>
            <p className="text-gray-300 leading-relaxed pl-6">
              {summary.outlook}
            </p>
          </div>
        )}

        {/* Reasoning */}
        {summary.reasoning && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-neon-purple" />
              <h4 className="text-sm font-semibold text-neon-purple uppercase tracking-wider">
                Key Drivers
              </h4>
            </div>
            <p className="text-gray-300 leading-relaxed pl-6">
              {summary.reasoning}
            </p>
          </div>
        )}

        {/* Recommendation */}
        {summary.recommendation && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-profit-green" />
              <h4 className="text-sm font-semibold text-profit-green uppercase tracking-wider">
                Recommendation
              </h4>
            </div>
            <p className="text-gray-300 leading-relaxed pl-6 font-medium">
              {summary.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="border-t border-warning-orange/30 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-warning-orange" />
            <h4 className="text-sm font-semibold text-warning-orange uppercase tracking-wider">
              Risk Warnings
            </h4>
          </div>
          <ul className="space-y-2 pl-7">
            {warnings.map((warning, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-sm text-gray-400 leading-relaxed list-disc"
              >
                {warning}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Badge */}
      <div className="mt-6 pt-4 border-t border-slate-dark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-accent animate-pulse" />
          <span className="text-xs text-gray-500 font-medium">
            AI-Generated Insights
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Updated in real-time
        </div>
      </div>
    </motion.div>
  );
}
