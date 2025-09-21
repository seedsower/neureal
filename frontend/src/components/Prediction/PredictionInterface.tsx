import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/solid';

import { useCurrentRound } from '../../hooks/useCurrentRound';
import { formatTokenAmount, formatDuration } from '../../utils/formatters';
import { POSITIONS, MIN_PREDICTION_AMOUNT, MAX_PREDICTION_AMOUNT } from '../../config/constants';

const PredictionInterface: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: currentRound, isLoading } = useCurrentRound();
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePositionSelect = (position: string) => {
    setSelectedPosition(position);
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPosition || !amount || !currentRound) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement prediction submission logic
      console.log('Submitting prediction:', { position: selectedPosition, amount });
    } catch (error) {
      console.error('Error submitting prediction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    return numAmount >= MIN_PREDICTION_AMOUNT && numAmount <= MAX_PREDICTION_AMOUNT;
  };

  const canSubmit = () => {
    return (
      isConnected &&
      selectedPosition &&
      amount &&
      isValidAmount() &&
      currentRound?.state === 'ACTIVE' &&
      !isSubmitting
    );
  };

  if (isLoading) {
    return (
      <div className="card-glass p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-3/4"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
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
          There's no active prediction round at the moment. Check back soon!
        </p>
      </div>
    );
  }

  const timeRemaining = currentRound.timeRemaining?.toLock || 0;
  const isRoundActive = currentRound.state === 'ACTIVE' && timeRemaining > 0;

  return (
    <div className="card-glass p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Make Prediction</h2>
        <div className="flex items-center text-sm text-slate-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          {isRoundActive ? (
            <span>Round ends in {formatDuration(timeRemaining)}</span>
          ) : (
            <span className="text-danger-400">Round closed for predictions</span>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <CurrencyDollarIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Connect your wallet to start predicting</p>
          <ConnectButton />
        </div>
      ) : !isRoundActive ? (
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">
            This round is no longer accepting predictions
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Position Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Choose Direction
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePositionSelect(POSITIONS.UP)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPosition === POSITIONS.UP
                    ? 'border-success-500 bg-success-500/20 text-success-300'
                    : 'border-slate-600 hover:border-success-500/50 text-slate-300'
                }`}
              >
                <ArrowUpIcon className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold">UP</div>
                <div className="text-xs opacity-75">Price will increase</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePositionSelect(POSITIONS.DOWN)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPosition === POSITIONS.DOWN
                    ? 'border-danger-500 bg-danger-500/20 text-danger-300'
                    : 'border-slate-600 hover:border-danger-500/50 text-slate-300'
                }`}
              >
                <ArrowDownIcon className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold">DOWN</div>
                <div className="text-xs opacity-75">Price will decrease</div>
              </motion.button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Stake Amount (NEURAL)
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={`${MIN_PREDICTION_AMOUNT} - ${formatTokenAmount(MAX_PREDICTION_AMOUNT)}`}
                className="input-primary w-full pr-16"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-400">
                NEURAL
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Min: {MIN_PREDICTION_AMOUNT} NEURAL</span>
              <span>Max: {formatTokenAmount(MAX_PREDICTION_AMOUNT)} NEURAL</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[10, 50, 100, 500].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="py-2 px-3 text-sm bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
              >
                {quickAmount}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={canSubmit() ? { scale: 1.02 } : {}}
            whileTap={canSubmit() ? { scale: 0.98 } : {}}
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              canSubmit()
                ? selectedPosition === POSITIONS.UP
                  ? 'btn-success'
                  : 'btn-danger'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              `Predict ${selectedPosition || 'Position'}`
            )}
          </motion.button>

          {/* Validation Messages */}
          {amount && !isValidAmount() && (
            <p className="text-danger-400 text-sm">
              Amount must be between {MIN_PREDICTION_AMOUNT} and {formatTokenAmount(MAX_PREDICTION_AMOUNT)} NEURAL
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionInterface;
