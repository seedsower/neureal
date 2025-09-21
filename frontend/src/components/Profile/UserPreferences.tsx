import React from 'react';
import { motion } from 'framer-motion';

const UserPreferences: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">User Preferences</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Theme
          </label>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-lg">
              Dark
            </button>
            <button className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg">
              Light
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Currency Display
          </label>
          <select className="input-primary w-full">
            <option value="USD">USD</option>
            <option value="ETH">ETH</option>
            <option value="NEURAL">NEURAL</option>
          </select>
        </div>
        
        <button className="btn-primary">
          Save Preferences
        </button>
      </div>
    </motion.div>
  );
};

export default UserPreferences;
