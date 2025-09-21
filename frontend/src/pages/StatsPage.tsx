import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';

import PlatformStats from '@/components/Stats/PlatformStats';
import RoundStats from '@/components/Stats/RoundStats';
import PredictionStats from '@/components/Stats/PredictionStats';
import PriceStats from '@/components/Stats/PriceStats';
import BlockchainStats from '@/components/Stats/BlockchainStats';

const StatsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const statsTabs = [
    { name: 'Platform', component: PlatformStats },
    { name: 'Rounds', component: RoundStats },
    { name: 'Predictions', component: PredictionStats },
    { name: 'Price', component: PriceStats },
    { name: 'Blockchain', component: BlockchainStats },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Platform Statistics
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Comprehensive analytics and insights about the Neureal prediction market
        </p>
      </motion.div>

      {/* Stats Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          {/* Tab List */}
          <Tab.List className="flex space-x-1 rounded-xl bg-dark-800/50 p-1 mb-8 overflow-x-auto">
            {statsTabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-3 px-6 text-sm font-medium leading-5 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900',
                    selected
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          {/* Tab Panels */}
          <Tab.Panels>
            {statsTabs.map((tab, index) => (
              <Tab.Panel key={tab.name}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <tab.component />
                </motion.div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </motion.div>
    </div>
  );
};

export default StatsPage;
