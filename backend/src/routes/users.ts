import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken, AuthRequest } from '@/middleware/auth';
import { getWeb3Service } from '@/config/web3';
import User from '@/models/User';
import Prediction from '@/models/Prediction';
import { logger } from '@/utils/logger';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  username: Joi.string().trim().max(50).optional(),
  bio: Joi.string().trim().max(500).optional(),
  avatar: Joi.string().uri().optional()
});

const updatePreferencesSchema = Joi.object({
  notifications: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    roundStart: Joi.boolean().optional(),
    roundEnd: Joi.boolean().optional(),
    winnings: Joi.boolean().optional()
  }).optional(),
  theme: Joi.string().valid('dark', 'light').optional(),
  currency: Joi.string().valid('USD', 'ETH', 'NEURAL').optional()
});

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userAddress = req.user!.address;

    try {
      const user = await User.findByAddress(userAddress);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get fresh stats from blockchain
      const web3Service = getWeb3Service();
      const blockchainStats = await web3Service.getUserStats(userAddress);

      // Update user stats in database
      await user.updateStats(blockchainStats);

      res.json({
        success: true,
        data: {
          address: user.address,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          stats: user.stats,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      });

    } catch (error) {
      logger.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile'
      });
    }
  })
);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const userAddress = req.user!.address;
    const { username, bio, avatar } = req.body;

    try {
      const user = await User.findByAddress(userAddress);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if username is already taken (if provided)
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ 
          username: username,
          address: { $ne: userAddress }
        });
        
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Username already taken'
          });
        }
      }

      // Update fields
      if (username !== undefined) user.username = username;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;

      await user.save();

      res.json({
        success: true,
        data: {
          address: user.address,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          stats: user.stats,
          preferences: user.preferences,
          updatedAt: user.updatedAt
        },
        message: 'Profile updated successfully'
      });

      logger.info(`Profile updated for user: ${userAddress}`);

    } catch (error) {
      logger.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  })
);

/**
 * @route   PUT /api/v1/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const { error } = updatePreferencesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const userAddress = req.user!.address;
    const { notifications, theme, currency } = req.body;

    try {
      const user = await User.findByAddress(userAddress);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update preferences
      if (notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...notifications
        };
      }
      
      if (theme) user.preferences.theme = theme;
      if (currency) user.preferences.currency = currency;

      await user.save();

      res.json({
        success: true,
        data: {
          preferences: user.preferences
        },
        message: 'Preferences updated successfully'
      });

    } catch (error) {
      logger.error('Error updating user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences'
      });
    }
  })
);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get detailed user statistics
 * @access  Private
 */
router.get('/stats',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userAddress = req.user!.address;

    try {
      const [user, predictionStats, recentPredictions] = await Promise.all([
        User.findByAddress(userAddress),
        Prediction.getUserStatistics(userAddress),
        Prediction.findByUser(userAddress, 10)
      ]);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get blockchain stats
      const web3Service = getWeb3Service();
      const blockchainStats = await web3Service.getUserStats(userAddress);
      const userRounds = await web3Service.getUserRounds(userAddress);

      // Calculate additional metrics
      const dbStats = predictionStats[0] || {};
      const avgPredictionAmount = dbStats.totalPredictions > 0 ? 
        dbStats.totalStaked / dbStats.totalPredictions : 0;

      // Get position preference
      const upPredictions = dbStats.upPredictions || 0;
      const downPredictions = dbStats.downPredictions || 0;
      const totalPredictions = upPredictions + downPredictions;
      
      const positionPreference = totalPredictions > 0 ? {
        up: (upPredictions / totalPredictions) * 100,
        down: (downPredictions / totalPredictions) * 100
      } : { up: 0, down: 0 };

      res.json({
        success: true,
        data: {
          blockchain: blockchainStats,
          database: dbStats,
          metrics: {
            avgPredictionAmount,
            positionPreference,
            totalRounds: userRounds.length,
            recentActivity: recentPredictions.slice(0, 5).map(pred => ({
              roundId: pred.roundId,
              position: pred.position,
              amount: pred.amount,
              predictedAt: pred.predictedAt,
              isWinning: pred.isWinning,
              claimed: pred.claimed
            }))
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  })
);

/**
 * @route   GET /api/v1/users/history
 * @desc    Get user's prediction history
 * @access  Private
 */
router.get('/history',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userAddress = req.user!.address;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    try {
      let query: any = { user: userAddress };
      
      if (status) {
        if (status === 'won') {
          query.isWinning = true;
        } else if (status === 'lost') {
          query.isWinning = false;
        } else if (status === 'pending') {
          query.isWinning = { $exists: false };
        } else if (status === 'claimed') {
          query.claimed = true;
        } else if (status === 'unclaimed') {
          query.claimed = false;
          query.isWinning = true;
        }
      }

      const predictions = await Prediction.find(query)
        .sort({ predictedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Prediction.countDocuments(query);

      // Get round details for each prediction
      const predictionsWithRounds = await Promise.all(
        predictions.map(async (prediction) => {
          const web3Service = getWeb3Service();
          try {
            const roundData = await web3Service.getRoundData(prediction.roundId);
            return {
              ...prediction.toJSON(),
              round: {
                startPrice: roundData.startPrice,
                lockPrice: roundData.lockPrice,
                endPrice: roundData.endPrice,
                state: roundData.state,
                resolved: roundData.resolved
              }
            };
          } catch (error) {
            return {
              ...prediction.toJSON(),
              round: null
            };
          }
        })
      );

      res.json({
        success: true,
        data: {
          predictions: predictionsWithRounds,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching user history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user history'
      });
    }
  })
);

/**
 * @route   GET /api/v1/users/portfolio
 * @desc    Get user's portfolio summary
 * @access  Private
 */
router.get('/portfolio',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userAddress = req.user!.address;

    try {
      const web3Service = getWeb3Service();
      
      // Get user stats and token balance
      const [userStats, tokenBalance, unclaimedPredictions] = await Promise.all([
        web3Service.getUserStats(userAddress),
        web3Service.getTokenBalance(userAddress),
        Prediction.getUnclaimedPredictions(userAddress)
      ]);

      // Calculate unclaimed rewards
      let totalUnclaimed = '0';
      const unclaimedWithAmounts = await Promise.all(
        unclaimedPredictions.map(async (prediction) => {
          try {
            const claimableAmount = await web3Service.getClaimableAmount(prediction.roundId, userAddress);
            return {
              roundId: prediction.roundId,
              amount: claimableAmount,
              position: prediction.position,
              stakedAmount: prediction.amount
            };
          } catch (error) {
            return {
              roundId: prediction.roundId,
              amount: '0',
              position: prediction.position,
              stakedAmount: prediction.amount
            };
          }
        })
      );

      totalUnclaimed = unclaimedWithAmounts
        .reduce((sum, pred) => sum + parseFloat(pred.amount), 0)
        .toString();

      // Get active predictions (in current round)
      const currentRoundId = await web3Service.getCurrentRoundId();
      const activePrediction = currentRoundId > 0 ? 
        await Prediction.findUserPredictionForRound(userAddress, currentRoundId) : null;

      res.json({
        success: true,
        data: {
          balance: {
            available: tokenBalance,
            staked: activePrediction?.amount || '0',
            unclaimed: totalUnclaimed
          },
          stats: userStats,
          activePrediction: activePrediction ? {
            roundId: activePrediction.roundId,
            position: activePrediction.position,
            amount: activePrediction.amount,
            predictedAt: activePrediction.predictedAt
          } : null,
          unclaimedRewards: unclaimedWithAmounts.filter(pred => parseFloat(pred.amount) > 0)
        }
      });

    } catch (error) {
      logger.error('Error fetching user portfolio:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user portfolio'
      });
    }
  })
);

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Deactivate user account
 * @access  Private
 */
router.delete('/account',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userAddress = req.user!.address;

    try {
      const user = await User.findByAddress(userAddress);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check for active predictions or unclaimed rewards
      const [activePredictions, unclaimedPredictions] = await Promise.all([
        Prediction.findOne({ 
          user: userAddress, 
          $or: [
            { isWinning: { $exists: false } }, // Pending predictions
            { claimed: false, isWinning: true } // Unclaimed rewards
          ]
        }),
        Prediction.getUnclaimedPredictions(userAddress)
      ]);

      if (activePredictions || unclaimedPredictions.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate account with active predictions or unclaimed rewards'
        });
      }

      // Deactivate user
      user.isActive = false;
      await user.save();

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });

      logger.info(`Account deactivated: ${userAddress}`);

    } catch (error) {
      logger.error('Error deactivating account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate account'
      });
    }
  })
);

export default router;
