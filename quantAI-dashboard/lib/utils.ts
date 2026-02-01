/**
 * Format a number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a large number with K/M/B suffixes
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Get color based on value (positive/negative)
 */
export function getValueColor(value: number): string {
  if (value > 0) return 'text-profit-green';
  if (value < 0) return 'text-loss-red';
  return 'text-gray-300';
}

/**
 * Get regime color
 */
export function getRegimeColor(regime: string): string {
  switch (regime) {
    case 'LOW_VOL':
      return 'text-profit-green';
    case 'NORMAL_VOL':
      return 'text-electric-blue';
    case 'HIGH_VOL':
      return 'text-warning-orange';
    default:
      return 'text-gray-300';
  }
}

/**
 * Get regime label
 */
export function getRegimeLabel(regime: string): string {
  switch (regime) {
    case 'LOW_VOL':
      return 'Low Volatility';
    case 'NORMAL_VOL':
      return 'Normal Volatility';
    case 'HIGH_VOL':
      return 'High Volatility';
    default:
      return regime;
  }
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(confidence: number): { label: string; color: string } {
  if (confidence >= 0.8) {
    return { label: 'Very High', color: 'text-profit-green' };
  }
  if (confidence >= 0.6) {
    return { label: 'High', color: 'text-electric-blue' };
  }
  if (confidence >= 0.4) {
    return { label: 'Moderate', color: 'text-warning-orange' };
  }
  return { label: 'Low', color: 'text-loss-red' };
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate simple moving average
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Merge class names (utility for Tailwind)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
