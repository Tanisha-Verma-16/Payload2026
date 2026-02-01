'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TickerSearchProps {
  tickers: string[];
  assetClasses: Record<string, string>;
  onSelect: (ticker: string) => void;
  selectedTicker: string;
}

export default function TickerSearch({
  tickers,
  assetClasses,
  onSelect,
  selectedTicker,
}: TickerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTickers, setFilteredTickers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tickers
        .filter((ticker) =>
          ticker.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 10);
      setFilteredTickers(filtered);
      setIsOpen(true);
    } else {
      setFilteredTickers([]);
      setIsOpen(false);
    }
  }, [searchTerm, tickers]);

  const handleSelect = (ticker: string) => {
    onSelect(ticker);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const getAssetClass = (ticker: string) => {
    return assetClasses[ticker] || 'UNKNOWN';
  };

  const getAssetClassColor = (assetClass: string) => {
    if (assetClass.includes('US_MEGACAP')) return 'text-electric-blue';
    if (assetClass.includes('INDIA')) return 'text-warning-orange';
    if (assetClass.includes('ETF')) return 'text-neon-purple';
    if (assetClass.includes('INDICES')) return 'text-gold-accent';
    if (assetClass.includes('COMMODITIES')) return 'text-profit-green';
    return 'text-gray-400';
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-electric-blue" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tickers (e.g., AAPL, MSFT, GOOGL)..."
          className={cn(
            'w-full pl-12 pr-4 py-4 rounded-xl',
            'glass-strong border-2 border-electric-blue/30',
            'text-white placeholder-gray-500',
            'focus:outline-none focus:border-electric-blue focus:shadow-neon',
            'transition-all duration-300',
            'font-mono text-lg'
          )}
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && filteredTickers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 z-50',
              'glass-strong rounded-xl border border-electric-blue/30',
              'max-h-96 overflow-y-auto',
              'shadow-2xl'
            )}
          >
            {filteredTickers.map((ticker, index) => {
              const assetClass = getAssetClass(ticker);
              return (
                <motion.button
                  key={ticker}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(ticker)}
                  className={cn(
                    'w-full px-6 py-4 flex items-center justify-between',
                    'hover:bg-electric-blue/10 transition-colors',
                    'border-b border-slate-dark/50 last:border-b-0',
                    'text-left'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <TrendingUp className="w-5 h-5 text-electric-blue" />
                    <div>
                      <div className="font-mono text-lg font-bold text-white">
                        {ticker}
                      </div>
                      <div className={cn('text-xs', getAssetClassColor(assetClass))}>
                        {assetClass.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                  {ticker === selectedTicker && (
                    <span className="text-electric-blue text-sm">✓ Selected</span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Selection Display */}
      {selectedTicker && !searchTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-3"
        >
          <span className="text-sm text-gray-400">Currently viewing:</span>
          <span className="font-mono text-xl font-bold text-electric-blue">
            {selectedTicker}
          </span>
          <span className={cn('text-xs px-2 py-1 rounded', getAssetClassColor(getAssetClass(selectedTicker)))}>
            {getAssetClass(selectedTicker).replace(/_/g, ' ')}
          </span>
        </motion.div>
      )}
    </div>
  );
}
