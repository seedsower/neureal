import React from 'react';
import { motion } from 'framer-motion';

const RecentRounds: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">Recent Rounds</h2>
      <div className="h-32 flex items-center justify-center bg-slate-800/50 rounded-lg">
        <p className="text-slate-400">Recent rounds history will be implemented here</p>
      </div>
    </motion.div>
  );
};

export default RecentRounds;
