import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';

import LeaderboardTable from '@/components/Leaderboard/LeaderboardTable';
import LeaderboardFilters from '@/components/Leaderboard/LeaderboardFilters';
import { LEADERBOARD_TYPES } from '@/config/constants';

const LeaderboardPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState(LEADERBOARD_TYPES.TOP_WINNERS);
  const [timeframe, setTimeframe] = useState('all');

  const leaderboardTabs = [
    { id: LEADERBOARD_TYPES.TOP_WINNERS, name: 'Top Winners', description: 'Highest total winnings' },
    { id: LEADERBOARD_TYPES.WIN_RATE, name: 'Win Rate', description: 'Best prediction accuracy' },
    { id: LEADERBOARD_TYPES.WIN_STREAK, name: 'Win Streak', description: 'Longest winning streaks' },
    { id: LEADERBOARD_TYPES.VOLUME, name: 'Volume', description: 'Highest trading volume' },
    { id: LEADERBOARD_TYPES.ROI, name: 'ROI', description: 'Best return on investment' },
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
          Leaderboard
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          See how you rank among the top predictors in the Neureal community
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <LeaderboardFilters
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </motion.div>

      {/* Leaderboard Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tab.Group
          selectedIndex={leaderboardTabs.findIndex(tab => tab.id === selectedType)}
          onChange={(index) => setSelectedType(leaderboardTabs[index].id)}
        >
          {/* Tab List */}
          <Tab.List className="flex space-x-1 rounded-xl bg-dark-800/50 p-1 mb-8 overflow-x-auto">
            {leaderboardTabs.map((tab) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-3 px-4 text-sm font-medium leading-5 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900',
                    selected
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  )
                }
              >
                <div className="text-center">
                  <div className="font-semibold">{tab.name}</div>
                  <div className="text-xs opacity-75 mt-1">{tab.description}</div>
                </div>
              </Tab>
            ))}
          </Tab.List>

          {/* Tab Panels */}
          <Tab.Panels>
            {leaderboardTabs.map((tab) => (
              <Tab.Panel key={tab.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LeaderboardTable
                    type={tab.id}
                    timeframe={timeframe}
                  />
                </motion.div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;
