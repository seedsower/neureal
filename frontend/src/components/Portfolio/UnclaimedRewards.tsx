import React from 'react';
import { motion } from 'framer-motion';

const UnclaimedRewards: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">Unclaimed Rewards</h2>
      <div className="h-32 flex items-center justify-center bg-slate-800/50 rounded-lg">
        <p className="text-slate-400">Unclaimed rewards will be displayed here</p>
      </div>
    </motion.div>
  );
};

export default UnclaimedRewards;
