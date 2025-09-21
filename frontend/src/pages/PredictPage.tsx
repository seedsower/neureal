import React from 'react';
import { motion } from 'framer-motion';

import PredictionInterface from '@/components/Prediction/PredictionInterface';
import CurrentRoundCard from '@/components/Prediction/CurrentRoundCard';
import PriceChart from '@/components/Charts/PriceChart';
import RecentRounds from '@/components/Prediction/RecentRounds';

const PredictPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Make Your Prediction
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Predict whether NEURAL token price will go UP or DOWN in the next 24 hours. 
          Stake your tokens and earn from correct predictions.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Chart and Current Round */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PriceChart />
          </motion.div>

          {/* Current Round Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CurrentRoundCard />
          </motion.div>
        </div>

        {/* Right Column - Prediction Interface */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PredictionInterface />
          </motion.div>
        </div>
      </div>

      {/* Recent Rounds */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <RecentRounds />
      </motion.div>
    </div>
  );
};

export default PredictPage;
