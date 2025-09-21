import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { formatTokenAmount, formatDuration, formatCurrency } from '@/utils/formatters';

const CurrentRoundCard: React.FC = () => {
  const { data: currentRound, isLoading } = useCurrentRound();

  if (isLoading) {
    return (
      <div className="card-glass p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRound) {
    return (
      <div className="card-glass p-6 text-center">
        <ClockIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Active Round</h3>
        <p className="text-slate-400">
          Waiting for the next prediction round to start...
        </p>
      </div>
    );
  }

  const totalPool = parseFloat(currentRound.totalUpAmount) + parseFloat(currentRound.totalDownAmount);
  const upPercentage = totalPool > 0 ? (parseFloat(currentRound.totalUpAmount) / totalPool) * 100 : 50;
  const downPercentage = 100 - upPercentage;

  const timeRemaining = currentRound.timeRemaining?.toLock || 0;
  const isActive = currentRound.state === 'ACTIVE' && timeRemaining > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Round #{currentRound.roundId}
          </h2>
          <div className="flex items-center text-sm text-slate-400 mt-1">
            <ClockIcon className="h-4 w-4 mr-1" />
            {isActive ? (
              <span className="text-success-400">
                {formatDuration(timeRemaining)} remaining
              </span>
            ) : (
              <span className="text-danger-400">
                {currentRound.state === 'LOCKED' ? 'Locked' : 'Resolved'}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-slate-400">Total Pool</div>
          <div className="text-lg font-bold text-white">
            {formatTokenAmount(totalPool)} NEURAL
          </div>
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-1">Start Price</div>
          <div className="text-lg font-semibold text-white">
            {formatCurrency(parseFloat(currentRound.startPrice))}
          </div>
        </div>
        
        {currentRound.lockPrice && (
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Lock Price</div>
            <div className="text-lg font-semibold text-white">
              {formatCurrency(parseFloat(currentRound.lockPrice))}
            </div>
          </div>
        )}
      </div>

      {/* Pool Distribution */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-300">Pool Distribution</h3>
        
        {/* UP Pool */}
        <div className="flex items-center justify-between p-3 bg-success-500/10 border border-success-500/20 rounded-lg">
          <div className="flex items-center">
            <ArrowUpIcon className="h-5 w-5 text-success-400 mr-2" />
            <span className="font-medium text-success-300">UP</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-success-300">
              {formatTokenAmount(currentRound.totalUpAmount)} NEURAL
            </div>
            <div className="text-xs text-success-400">
              {upPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* DOWN Pool */}
        <div className="flex items-center justify-between p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg">
          <div className="flex items-center">
            <ArrowDownIcon className="h-5 w-5 text-danger-400 mr-2" />
            <span className="font-medium text-danger-300">DOWN</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-danger-300">
              {formatTokenAmount(currentRound.totalDownAmount)} NEURAL
            </div>
            <div className="text-xs text-danger-400">
              {downPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Visual Distribution Bar */}
        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${upPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute left-0 top-0 h-full bg-success-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${downPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute right-0 top-0 h-full bg-danger-500"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-700/50">
        <div className="text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Participants</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {(currentRound.statistics?.totalParticipants || 0).toLocaleString()}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-1">Avg Stake</div>
          <div className="text-lg font-semibold text-white">
            {currentRound.statistics?.totalParticipants > 0
              ? formatTokenAmount(totalPool / currentRound.statistics.totalParticipants)
              : '0'} NEURAL
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CurrentRoundCard;
