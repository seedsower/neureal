import React from 'react';
import { motion } from 'framer-motion';

const UserStats: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">Your Statistics</h2>
      <div className="space-y-4">
        {['Win Rate', 'Total Rounds', 'Current Streak', 'Best Streak'].map((stat) => (
          <div key={stat} className="flex justify-between items-center">
            <span className="text-slate-400">{stat}</span>
            <span className="text-white font-semibold">--</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default UserStats;
