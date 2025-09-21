import React from 'react';
import { motion } from 'framer-motion';

interface LeaderboardFiltersProps {
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({ 
  timeframe, 
  onTimeframeChange 
}) => {
  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: '30d', label: '30 Days' },
    { value: '7d', label: '7 Days' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <div className="flex space-x-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf.value
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardFilters;
