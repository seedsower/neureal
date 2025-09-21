import React from 'react';
import { motion } from 'framer-motion';

const PlatformStats: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '10,234', change: '+12%' },
          { label: 'Total Volume', value: '$2.5M', change: '+8%' },
          { label: 'Active Rounds', value: '1', change: '0%' },
          { label: 'Total Predictions', value: '45,678', change: '+15%' },
        ].map((stat, index) => (
          <div key={stat.label} className="card-glass p-6 text-center">
            <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
            <div className="text-xs text-success-400">{stat.change}</div>
          </div>
        ))}
      </div>
      
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Overview</h3>
        <div className="h-64 flex items-center justify-center bg-slate-800/50 rounded-lg">
          <p className="text-slate-400">Platform statistics charts will be displayed here</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PlatformStats;
