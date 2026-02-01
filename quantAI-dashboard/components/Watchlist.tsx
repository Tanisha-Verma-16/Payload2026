'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchlistItem {
  ticker: string;
  addedAt: number;
  lastPrice?: number;
  change?: number;
}

interface WatchlistProps {
  onSelectTicker: (ticker: string) => void;
  availableTickers: string[];
}

export default function Watchlist({ onSelectTicker, availableTickers }: WatchlistProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quant-watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('quant-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (ticker: string) => {
    if (!watchlist.find(item => item.ticker === ticker)) {
      setWatchlist([...watchlist, { ticker, addedAt: Date.now() }]);
      setSearchTerm('');
      setIsAdding(false);
    }
  };

  const removeFromWatchlist = (ticker: string) => {
    setWatchlist(watchlist.filter(item => item.ticker !== ticker));
  };

  const filteredTickers = availableTickers.filter(ticker =>
    ticker.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !watchlist.find(item => item.ticker === ticker)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl p-6 border border-gold-accent/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-gold-accent" />
          <h3 className="text-lg font-bold font-display text-gold-accent">
            My Watchlist
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isAdding
              ? 'bg-loss-red/20 text-loss-red hover:bg-loss-red/30'
              : 'bg-profit-green/20 text-profit-green hover:bg-profit-green/30'
          )}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* Add Ticker Interface */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickers to add..."
              className="w-full px-4 py-3 rounded-lg glass border border-electric-blue/30 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue"
              autoFocus
            />
            
            {searchTerm && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {filteredTickers.slice(0, 5).map((ticker) => (
                  <button
                    key={ticker}
                    onClick={() => addToWatchlist(ticker)}
                    className="w-full px-4 py-2 text-left rounded-lg glass hover:bg-electric-blue/10 transition-colors"
                  >
                    <span className="font-mono text-electric-blue">{ticker}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watchlist Items */}
      <div className="space-y-2">
        <AnimatePresence>
          {watchlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-gray-500"
            >
              <Star className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tickers in watchlist</p>
              <p className="text-xs mt-1">Click + to add your favorites</p>
            </motion.div>
          ) : (
            watchlist.map((item, idx) => (
              <motion.div
                key={item.ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="glass rounded-lg p-4 border border-slate-dark/50 hover:border-gold-accent/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSelectTicker(item.ticker)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-gold-accent fill-gold-accent" />
                      <div>
                        <div className="font-mono font-bold text-white text-lg">
                          {item.ticker}
                        </div>
                        <div className="text-xs text-gray-400">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => removeFromWatchlist(item.ticker)}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-loss-red/20 text-loss-red transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      {watchlist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-dark">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              {watchlist.length} ticker{watchlist.length !== 1 ? 's' : ''} saved
            </span>
            <button
              onClick={() => setWatchlist([])}
              className="text-loss-red hover:text-loss-red/80 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-slate-dark/30 rounded-lg border border-gold-accent/20">
        <p className="text-xs text-gray-400">
          💡 <span className="text-gold-accent font-semibold">Pro Tip:</span> Save your favorite tickers for quick access. Your watchlist is saved locally in your browser.
        </p>
      </div>
    </motion.div>
  );
}
