import React from 'react';
import { motion } from 'framer-motion';

import PortfolioOverview from '../components/Portfolio/PortfolioOverview';
import ActivePredictions from '../components/Portfolio/ActivePredictions';
import PredictionHistory from '../components/Portfolio/PredictionHistory';
import UnclaimedRewards from '../components/Portfolio/UnclaimedRewards';
import UserStats from '../components/Portfolio/UserStats';

const PortfolioPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Your Portfolio
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Track your predictions, manage your NEURAL tokens, and monitor your performance
        </p>
      </motion.div>

      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PortfolioOverview />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Predictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ActivePredictions />
          </motion.div>

          {/* Prediction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PredictionHistory />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Unclaimed Rewards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <UnclaimedRewards />
          </motion.div>

          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <UserStats />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
