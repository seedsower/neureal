import React from 'react';
import { motion } from 'framer-motion';

const PredictionStats: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Prediction Statistics</h3>
      <div className="h-64 flex items-center justify-center bg-slate-800/50 rounded-lg">
        <p className="text-slate-400">Prediction statistics will be displayed here</p>
      </div>
    </motion.div>
  );
};

export default PredictionStats;
