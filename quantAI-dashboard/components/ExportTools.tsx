'use client';

import { motion } from 'framer-motion';
import { Download, FileText, Table } from 'lucide-react';
import { useState } from 'react';

interface ExportToolsProps {
  data: any;
  ticker: string;
}

export default function ExportTools({ data, ticker }: ExportToolsProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    
    // Prepare CSV data
    const csvRows = [];
    
    // Headers
    csvRows.push([
      'Metric',
      'Value'
    ].join(','));

    // Data rows
    csvRows.push(`Ticker,${ticker}`);
    csvRows.push(`Current Price,$${data.market_data.data[0].Close.toFixed(2)}`);
    csvRows.push(`Sharpe Ratio,${data.risk_metrics.sharpe_ratio.toFixed(2)}`);
    csvRows.push(`Max Drawdown,${data.risk_metrics.max_drawdown.toFixed(2)}%`);
    csvRows.push(`Expected Return,${data.risk_metrics.expected_return.toFixed(2)}%`);
    csvRows.push(`VaR 95%,${data.risk_metrics.var_95.toFixed(2)}%`);
    csvRows.push(`CVaR 95%,${data.risk_metrics.cvar_95.toFixed(2)}%`);
    csvRows.push(`Predicted Regime,${data.regime_prediction.predicted_regime_21d}`);
    csvRows.push(`Confidence,${(data.regime_prediction.confidence * 100).toFixed(1)}%`);
    csvRows.push(`Primary Strategy,${data.strategy_recommendation.recommendation.primary_strategy}`);
    csvRows.push(`Risk Posture,${data.strategy_recommendation.recommendation.risk_posture}`);
    csvRows.push(`Equity Exposure,${(data.strategy_recommendation.recommendation.equity_exposure * 100).toFixed(1)}%`);

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticker}_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setTimeout(() => setExporting(false), 1000);
  };

  const exportToJSON = () => {
    setExporting(true);

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticker}_analysis_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setTimeout(() => setExporting(false), 1000);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-xl p-6 border border-gold-accent/30"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Download className="w-5 h-5 text-gold-accent" />
        <h3 className="text-base font-bold text-gold-accent">
          Export Analysis
        </h3>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg border border-profit-green/30 text-profit-green hover:bg-profit-green/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Table className="w-4 h-4" />
          <span className="text-sm font-semibold">Export CSV</span>
        </button>

        <button
          onClick={exportToJSON}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-semibold">Export JSON</span>
        </button>

        <button
          onClick={printReport}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-semibold">Print Report</span>
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-slate-dark/30 rounded-lg border border-gold-accent/20">
        <p className="text-xs text-gray-400">
          💡 <span className="text-gold-accent font-semibold">Export Options:</span> Download analysis data in CSV format for Excel, JSON for APIs, or print a full report.
        </p>
      </div>
    </motion.div>
  );
}
