import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { usePrice } from '@/hooks/usePrice';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface PriceDisplayProps {
  compact?: boolean;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ compact = false, className = '' }) => {
  const { data: priceData, isLoading } = usePrice();

  if (isLoading || !priceData) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="skeleton h-6 w-20 rounded" />
        {!compact && <div className="skeleton h-4 w-16 rounded" />}
      </div>
    );
  }

  const isPositive = priceData.change24h >= 0;
  const changeColor = isPositive ? 'text-success-400' : 'text-danger-400';
  const bgColor = isPositive ? 'bg-success-500/10' : 'bg-danger-500/10';
  const borderColor = isPositive ? 'border-success-500/20' : 'border-danger-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center space-x-3 ${className}`}
    >
      {/* Price */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-slate-400">NEURAL</span>
        <motion.span
          key={priceData.price}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold text-white"
        >
          {formatCurrency(priceData.price)}
        </motion.span>
      </div>

      {/* 24h Change */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center space-x-1 px-2 py-1 rounded-md border ${bgColor} ${borderColor}`}
      >
        {isPositive ? (
          <ArrowUpIcon className="h-3 w-3 text-success-400" />
        ) : (
          <ArrowDownIcon className="h-3 w-3 text-danger-400" />
        )}
        <span className={`text-sm font-medium ${changeColor}`}>
          {formatPercentage(Math.abs(priceData.change24h))}
        </span>
      </motion.div>

      {/* Additional info for non-compact mode */}
      {!compact && (
        <div className="hidden xl:flex items-center space-x-4 text-sm text-slate-400">
          <div>
            <span className="font-medium">Vol: </span>
            <span>{formatCurrency(priceData.volume24h, { compact: true })}</span>
          </div>
          <div>
            <span className="font-medium">MCap: </span>
            <span>{formatCurrency(priceData.marketCap, { compact: true })}</span>
          </div>
        </div>
      )}

      {/* Live indicator */}
      <div className="flex items-center space-x-1">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-2 w-2 bg-success-400 rounded-full"
        />
        {!compact && (
          <span className="text-xs text-slate-500 font-medium">LIVE</span>
        )}
      </div>
    </motion.div>
  );
};

export default PriceDisplay;
