/**
 * Utility functions for formatting numbers, currencies, dates, etc.
 */

// Number formatting options
interface FormatOptions {
  decimals?: number;
  compact?: boolean;
  currency?: string;
  locale?: string;
}

/**
 * Format a number as currency
 */
export const formatCurrency = (
  value: number | string,
  options: FormatOptions = {}
): string => {
  const {
    decimals = 2,
    compact = false,
    currency = 'USD',
    locale = 'en-US'
  } = options;

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '$0.00';

  if (compact) {
    return formatCompactNumber(numValue, currency === 'USD' ? '$' : '');
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue);
  } catch {
    // Fallback for unsupported currencies
    const symbol = currency === 'USD' ? '$' : currency === 'ETH' ? 'Ξ' : '';
    return `${symbol}${numValue.toFixed(decimals)}`;
  }
};

/**
 * Format a number as a token amount
 */
export const formatTokenAmount = (
  value: number | string,
  options: FormatOptions = {}
): string => {
  const {
    decimals = 4,
    compact = false,
  } = options;

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';

  if (compact) {
    return formatCompactNumber(numValue);
  }

  // Use different decimal places based on value size
  let displayDecimals = decimals;
  if (numValue >= 1000) {
    displayDecimals = 2;
  } else if (numValue >= 1) {
    displayDecimals = 4;
  } else if (numValue >= 0.01) {
    displayDecimals = 6;
  } else {
    displayDecimals = 8;
  }

  return numValue.toFixed(displayDecimals).replace(/\.?0+$/, '');
};

/**
 * Format a percentage
 */
export const formatPercentage = (
  value: number | string,
  decimals: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';

  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Format large numbers in compact form (1.2K, 1.5M, etc.)
 */
export const formatCompactNumber = (
  value: number,
  prefix: string = ''
): string => {
  if (value === 0) return `${prefix}0`;

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}${prefix}${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${prefix}${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${prefix}${(absValue / 1e3).toFixed(1)}K`;
  } else {
    return `${sign}${prefix}${absValue.toFixed(absValue < 1 ? 4 : 2)}`;
  }
};

/**
 * Format an Ethereum address
 */
export const formatAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!address || address.length < startChars + endChars) {
    return address || '';
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format a transaction hash
 */
export const formatTxHash = (hash: string): string => {
  return formatAddress(hash, 8, 6);
};

/**
 * Format time duration (e.g., "2h 30m", "1d 5h")
 */
export const formatDuration = (seconds: number): string => {
  if (seconds <= 0) return '0s';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  if (secs > 0 && days === 0 && hours === 0) parts.push(`${secs}s`);

  return parts.slice(0, 2).join(' ') || '0s';
};

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = targetDate.getTime() - now.getTime();
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);

  const isPast = diffMs < 0;
  const suffix = isPast ? 'ago' : 'from now';

  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ${suffix}`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ${suffix}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${suffix}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${suffix}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ${suffix}`;
};

/**
 * Format a date in a readable format
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format a number with thousand separators
 */
export const formatNumber = (
  value: number | string,
  decimals: number = 0
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Format a win rate as a colored percentage
 */
export const formatWinRate = (winRate: number): { text: string; color: string } => {
  const percentage = formatPercentage(winRate);
  
  let color = 'text-slate-400';
  if (winRate >= 70) {
    color = 'text-success-400';
  } else if (winRate >= 50) {
    color = 'text-primary-400';
  } else if (winRate >= 30) {
    color = 'text-accent-400';
  } else {
    color = 'text-danger-400';
  }

  return { text: percentage, color };
};

/**
 * Format ROI with appropriate color
 */
export const formatROI = (roi: number): { text: string; color: string } => {
  const percentage = formatPercentage(roi);
  const color = roi >= 0 ? 'text-success-400' : 'text-danger-400';
  const prefix = roi > 0 ? '+' : '';
  
  return { text: `${prefix}${percentage}`, color };
};
