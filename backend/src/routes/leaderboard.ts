import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { cacheService } from '@/config/redis';
import User from '@/models/User';
import Prediction from '@/models/Prediction';
import { logger } from '@/utils/logger';

const router = express.Router();

/**
 * @route   GET /api/v1/leaderboard/top-winners
 * @desc    Get top winners leaderboard
 * @access  Public
 */
router.get('/top-winners',
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const timeframe = req.query.timeframe as string || 'all'; // all, 7d, 30d

    try {
      const cacheKey = `leaderboard:winners:${timeframe}:${limit}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      let query: any = { isActive: true };
      let sortField = 'stats.totalWinnings';

      // Apply timeframe filter if needed
      if (timeframe !== 'all') {
        const days = timeframe === '7d' ? 7 : 30;
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        // For time-based queries, we need to aggregate from predictions
        const timeBasedWinners = await Prediction.aggregate([
          {
            $match: {
              predictedAt: { $gte: cutoffDate },
              isWinning: true,
              claimed: true
            }
          },
          {
            $group: {
              _id: '$user',
              totalWinnings: { $sum: { $toDouble: '$payout' } },
              totalStaked: { $sum: { $toDouble: '$amount' } },
              winCount: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: 'address',
              as: 'userInfo'
            }
          },
          {
            $unwind: '$userInfo'
          },
          {
            $match: {
              'userInfo.isActive': true
            }
          },
          {
            $addFields: {
              roi: {
                $cond: [
                  { $gt: ['$totalStaked', 0] },
                  { $multiply: [{ $divide: [{ $subtract: ['$totalWinnings', '$totalStaked'] }, '$totalStaked'] }, 100] },
                  0
                ]
              }
            }
          },
          {
            $sort: { totalWinnings: -1 }
          },
          {
            $limit: limit
          },
          {
            $project: {
              address: '$_id',
              username: '$userInfo.username',
              avatar: '$userInfo.avatar',
              totalWinnings: { $toString: '$totalWinnings' },
              totalStaked: { $toString: '$totalStaked' },
              winCount: 1,
              roi: 1,
              createdAt: '$userInfo.createdAt'
            }
          }
        ]);

        const leaderboard = timeBasedWinners.map((user, index) => ({
          rank: index + 1,
          ...user
        }));

        // Cache for 5 minutes
        await cacheService.set(cacheKey, JSON.stringify(leaderboard), 300);

        return res.json({
          success: true,
          data: leaderboard
        });
      }

      // For 'all' timeframe, use the simpler user stats query
      const topUsers = await User.find(query)
        .sort({ [sortField]: -1 })
        .limit(limit)
        .select('address username avatar stats createdAt');

      const leaderboard = topUsers.map((user, index) => ({
        rank: index + 1,
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        totalWinnings: user.stats.totalWinnings,
        totalStaked: user.stats.totalStaked,
        winCount: user.stats.wonRounds,
        roi: user.stats.roi,
        createdAt: user.createdAt
      }));

      // Cache for 5 minutes
      await cacheService.set(cacheKey, JSON.stringify(leaderboard), 300);

      res.json({
        success: true,
        data: leaderboard
      });

    } catch (error) {
      logger.error('Error fetching top winners leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard'
      });
    }
  })
);

/**
 * @route   GET /api/v1/leaderboard/win-rate
 * @desc    Get highest win rate leaderboard
 * @access  Public
 */
router.get('/win-rate',
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const minRounds = parseInt(req.query.minRounds as string) || 10;

    try {
      const cacheKey = `leaderboard:winrate:${limit}:${minRounds}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      const topUsers = await User.find({
        isActive: true,
        'stats.totalRounds': { $gte: minRounds }
      })
        .sort({ 'stats.winRate': -1, 'stats.totalRounds': -1 })
        .limit(limit)
        .select('address username avatar stats createdAt');

      const leaderboard = topUsers.map((user, index) => ({
        rank: index + 1,
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        winRate: user.stats.winRate,
        totalRounds: user.stats.totalRounds,
        wonRounds: user.stats.wonRounds,
        currentWinStreak: user.stats.currentWinStreak,
        maxWinStreak: user.stats.maxWinStreak,
        createdAt: user.createdAt
      }));

      // Cache for 5 minutes
      await cacheService.set(cacheKey, JSON.stringify(leaderboard), 300);

      res.json({
        success: true,
        data: leaderboard
      });

    } catch (error) {
      logger.error('Error fetching win rate leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch win rate leaderboard'
      });
    }
  })
);

/**
 * @route   GET /api/v1/leaderboard/win-streak
 * @desc    Get longest win streak leaderboard
 * @access  Public
 */
router.get('/win-streak',
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const type = req.query.type as string || 'max'; // max or current

    try {
      const cacheKey = `leaderboard:streak:${type}:${limit}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      const sortField = type === 'current' ? 'stats.currentWinStreak' : 'stats.maxWinStreak';
      
      const topUsers = await User.find({
        isActive: true,
        [sortField]: { $gt: 0 }
      })
        .sort({ [sortField]: -1, 'stats.totalRounds': -1 })
        .limit(limit)
        .select('address username avatar stats createdAt');

      const leaderboard = topUsers.map((user, index) => ({
        rank: index + 1,
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        currentWinStreak: user.stats.currentWinStreak,
        maxWinStreak: user.stats.maxWinStreak,
        totalRounds: user.stats.totalRounds,
        wonRounds: user.stats.wonRounds,
        winRate: user.stats.winRate,
        createdAt: user.createdAt
      }));

      // Cache for 5 minutes
      await cacheService.set(cacheKey, JSON.stringify(leaderboard), 300);

      res.json({
        success: true,
        data: leaderboard
      });

    } catch (error) {
      logger.error('Error fetching win streak leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch win streak leaderboard'
      });
    }
  })
);

/**
 * @route   GET /api/v1/leaderboard/volume
 * @desc    Get highest volume traders leaderboard
 * @access  Public
 */
router.get('/volume',
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const timeframe = req.query.timeframe as string || 'all';

    try {
      const cacheKey = `leaderboard:volume:${timeframe}:${limit}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      let matchStage: any = {};
      
      if (timeframe !== 'all') {
        const days = timeframe === '7d' ? 7 : 30;
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        matchStage.predictedAt = { $gte: cutoffDate };
      }

      const volumeLeaders = await Prediction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$user',
            totalVolume: { $sum: { $toDouble: '$amount' } },
            predictionCount: { $sum: 1 },
            avgPredictionSize: { $avg: { $toDouble: '$amount' } }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'address',
            as: 'userInfo'
          }
        },
        {
          $unwind: '$userInfo'
        },
        {
          $match: {
            'userInfo.isActive': true
          }
        },
        {
          $sort: { totalVolume: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            address: '$_id',
            username: '$userInfo.username',
            avatar: '$userInfo.avatar',
            totalVolume: { $toString: '$totalVolume' },
            predictionCount: 1,
            avgPredictionSize: { $toString: '$avgPredictionSize' },
            createdAt: '$userInfo.createdAt'
          }
        }
      ]);

      const leaderboard = volumeLeaders.map((user, index) => ({
        rank: index + 1,
        ...user
      }));

      // Cache for 5 minutes
      await cacheService.set(cacheKey, JSON.stringify(leaderboard), 300);

      res.json({
        success: true,
        data: leaderboard
      });

    } catch (error) {
      logger.error('Error fetching volume leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch volume leaderboard'
      });
    }
  })
);

/**
 * @route   GET /api/v1/leaderboard/roi
 * @desc    Get highest ROI leaderboard
 * @access  Public
 */
router.get('/roi',
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const minStaked = parseFloat(req.query.minStaked as string) || 100; // Minimum staked amount

    try {
      const cacheKey = `leaderboard:roi:${limit}:${minStaked}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      const topUsers = await User.find({
        isActive: true,
        'stats.totalStaked': { $gte: minStaked.toString() },
        'stats.roi': { $gt: 0 }
      })
        .sort({ 'stats.roi': -1, 'stats.totalStaked': -1 })
        .limit(limit)
        .select('address username avatar stats createdAt');

      const leaderboard = topUsers.map((user, index) => ({
        rank: index + 1,
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        roi: user.stats.roi,
        totalStaked: user.stats.totalStaked,
        totalWinnings: user.stats.totalWinnings,
        winRate: user.stats.winRate,
        totalRounds: user.stats.totalRounds,
        createdAt: user.createdAt
      }));

      // Cache for 5 minutes
      await cacheService.set(cacheKey, JSON.stringify(leaderboard), 300);

      res.json({
        success: true,
        data: leaderboard
      });

    } catch (error) {
      logger.error('Error fetching ROI leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ROI leaderboard'
      });
    }
  })
);

/**
 * @route   GET /api/v1/leaderboard/user/:address
 * @desc    Get user's ranking in different leaderboards
 * @access  Public
 */
router.get('/user/:address',
  asyncHandler(async (req, res) => {
    const address = req.params.address.toLowerCase();

    try {
      const user = await User.findByAddress(address);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's rankings in different categories
      const [winningsRank, winRateRank, streakRank, volumeRank, roiRank] = await Promise.all([
        // Winnings rank
        User.countDocuments({
          isActive: true,
          'stats.totalWinnings': { $gt: user.stats.totalWinnings }
        }),
        
        // Win rate rank (minimum 10 rounds)
        User.countDocuments({
          isActive: true,
          'stats.totalRounds': { $gte: 10 },
          $or: [
            { 'stats.winRate': { $gt: user.stats.winRate } },
            { 
              'stats.winRate': user.stats.winRate,
              'stats.totalRounds': { $gt: user.stats.totalRounds }
            }
          ]
        }),
        
        // Max win streak rank
        User.countDocuments({
          isActive: true,
          $or: [
            { 'stats.maxWinStreak': { $gt: user.stats.maxWinStreak } },
            {
              'stats.maxWinStreak': user.stats.maxWinStreak,
              'stats.totalRounds': { $gt: user.stats.totalRounds }
            }
          ]
        }),
        
        // Volume rank
        User.countDocuments({
          isActive: true,
          'stats.totalStaked': { $gt: user.stats.totalStaked }
        }),
        
        // ROI rank (minimum 100 staked)
        User.countDocuments({
          isActive: true,
          'stats.totalStaked': { $gte: '100' },
          $or: [
            { 'stats.roi': { $gt: user.stats.roi } },
            {
              'stats.roi': user.stats.roi,
              'stats.totalStaked': { $gt: user.stats.totalStaked }
            }
          ]
        })
      ]);

      res.json({
        success: true,
        data: {
          user: {
            address: user.address,
            username: user.username,
            avatar: user.avatar,
            stats: user.stats
          },
          rankings: {
            winnings: winningsRank + 1,
            winRate: winRateRank + 1,
            maxWinStreak: streakRank + 1,
            volume: volumeRank + 1,
            roi: roiRank + 1
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching user rankings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user rankings'
      });
    }
  })
);

export default router;
