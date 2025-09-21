import React from 'react';
import { motion } from 'framer-motion';

const PriceChart: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">NEURAL Price Chart</h2>
      <div className="h-64 flex items-center justify-center bg-slate-800/50 rounded-lg">
        <p className="text-slate-400">Price chart will be implemented here</p>
      </div>
    </motion.div>
  );
};

export default PriceChart;
