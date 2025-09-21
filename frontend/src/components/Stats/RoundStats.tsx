import React from 'react';
import { motion } from 'framer-motion';

const RoundStats: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Round Statistics</h3>
      <div className="h-64 flex items-center justify-center bg-slate-800/50 rounded-lg">
        <p className="text-slate-400">Round statistics will be displayed here</p>
      </div>
    </motion.div>
  );
};

export default RoundStats;
