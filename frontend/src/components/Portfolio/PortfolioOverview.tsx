import React from 'react';
import { motion } from 'framer-motion';

const PortfolioOverview: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">Portfolio Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Available Balance', 'Staked Amount', 'Total Winnings', 'Win Rate'].map((metric) => (
          <div key={metric} className="text-center p-4 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">{metric}</div>
            <div className="text-lg font-bold text-white">--</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PortfolioOverview;
