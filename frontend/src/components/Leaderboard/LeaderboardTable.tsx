import React from 'react';
import { motion } from 'framer-motion';

interface LeaderboardTableProps {
  type: string;
  timeframe: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ type, timeframe }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Leaderboard
        </h2>
        <span className="text-sm text-slate-400">
          Timeframe: {timeframe === 'all' ? 'All Time' : timeframe.toUpperCase()}
        </span>
      </div>
      <div className="h-64 flex items-center justify-center bg-slate-800/50 rounded-lg">
        <p className="text-slate-400">Leaderboard data will be displayed here</p>
      </div>
    </motion.div>
  );
};

export default LeaderboardTable;
