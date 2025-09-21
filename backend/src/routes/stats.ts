import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { cacheService } from '@/config/redis';
import { getPriceService } from '@/services/priceService';
import { getWeb3Service } from '@/config/web3';
import User from '@/models/User';
import Round from '@/models/Round';
import Prediction from '@/models/Prediction';
import { logger } from '@/utils/logger';

const router = express.Router();

/**
 * @route   GET /api/v1/stats/platform
 * @desc    Get platform-wide statistics
 * @access  Public
 */
router.get('/platform',
  asyncHandler(async (req, res) => {
    try {
      const cacheKey = 'platform_stats';
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      // Calculate fresh statistics
      const [
        totalUsers,
        activeUsers,
        totalRounds,
        activeRounds,
        totalPredictions,
        totalVolumeResult,
        recentRounds
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Round.countDocuments(),
        Round.countDocuments({ state: { $in: ['ACTIVE', 'LOCKED'] } }),
        Prediction.countDocuments(),
        Prediction.aggregate([
          { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ]),
        Round.find({ resolved: true })
          .sort({ roundId: -1 })
          .limit(10)
          .select('roundId participantCount totalUpAmount totalDownAmount')
      ]);

      const totalVolume = totalVolumeResult[0]?.total || 0;

      // Calculate average participants from recent rounds
      const avgParticipants = recentRounds.length > 0 
        ? recentRounds.reduce((sum, round) => sum + round.participantCount, 0) / recentRounds.length
        : 0;

      // Get current price info
      const priceService = getPriceService();
      const currentPrice = await priceService.getCurrentPrice();
      const priceStats = await priceService.getPriceStats();

      // Calculate 24h statistics
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [
        newUsers24h,
        predictions24h,
        volume24h
      ] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: oneDayAgo } }),
        Prediction.countDocuments({ predictedAt: { $gte: oneDayAgo } }),
        Prediction.aggregate([
          { $match: { predictedAt: { $gte: oneDayAgo } } },
          { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ])
      ]);

      const volume24hResult = volume24h[0]?.total || 0;

      const platformStats = {
        overview: {
          totalUsers,
          activeUsers,
          totalRounds,
          activeRounds,
          totalPredictions,
          totalVolume: totalVolume.toString(),
          avgParticipants: Math.round(avgParticipants)
        },
        daily: {
          newUsers: newUsers24h,
          predictions: predictions24h,
          volume: volume24hResult.toString()
        },
        price: {
          current: currentPrice?.price || 0,
          change24h: currentPrice?.change24h || 0,
          high24h: priceStats?.high24h || 0,
          low24h: priceStats?.low24h || 0,
          volume24h: priceStats?.volume24h || 0
        },
        lastUpdated: new Date()
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, JSON.stringify(platformStats), 300);

      res.json({
        success: true,
        data: platformStats
      });

    } catch (error) {
      logger.error('Error fetching platform stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch platform statistics'
      });
    }
  })
);

/**
 * @route   GET /api/v1/stats/rounds
 * @desc    Get round statistics
 * @access  Public
 */
router.get('/rounds',
  asyncHandler(async (req, res) => {
    const timeframe = req.query.timeframe as string || '7d'; // 7d, 30d, all

    try {
      const cacheKey = `round_stats:${timeframe}`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      let matchStage: any = { resolved: true };
      
      if (timeframe !== 'all') {
        const days = timeframe === '7d' ? 7 : 30;
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        matchStage.createdAt = { $gte: cutoffDate };
      }

      const roundStats = await Round.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRounds: { $sum: 1 },
            avgParticipants: { $avg: '$participantCount' },
            totalVolume: { 
              $sum: { 
                $add: [
                  { $toDouble: '$totalUpAmount' },
                  { $toDouble: '$totalDownAmount' }
                ]
              }
            },
            avgVolume: {
              $avg: {
                $add: [
                  { $toDouble: '$totalUpAmount' },
                  { $toDouble: '$totalDownAmount' }
                ]
              }
            },
            upWins: {
              $sum: {
                $cond: [{ $eq: ['$winningPosition', 'UP'] }, 1, 0]
              }
            },
            downWins: {
              $sum: {
                $cond: [{ $eq: ['$winningPosition', 'DOWN'] }, 1, 0]
              }
            }
          }
        },
        {
          $addFields: {
            upWinRate: {
              $cond: [
                { $gt: ['$totalRounds', 0] },
                { $multiply: [{ $divide: ['$upWins', '$totalRounds'] }, 100] },
                0
              ]
            },
            downWinRate: {
              $cond: [
                { $gt: ['$totalRounds', 0] },
                { $multiply: [{ $divide: ['$downWins', '$totalRounds'] }, 100] },
                0
              ]
            }
          }
        }
      ]);

      const stats = roundStats[0] || {
        totalRounds: 0,
        avgParticipants: 0,
        totalVolume: 0,
        avgVolume: 0,
        upWins: 0,
        downWins: 0,
        upWinRate: 0,
        downWinRate: 0
      };

      // Get recent round performance
      const recentRounds = await Round.find(matchStage)
        .sort({ roundId: -1 })
        .limit(20)
        .select('roundId startTime endTime participantCount totalUpAmount totalDownAmount winningPosition');

      const result = {
        summary: {
          totalRounds: stats.totalRounds,
          avgParticipants: Math.round(stats.avgParticipants),
          totalVolume: stats.totalVolume.toString(),
          avgVolume: stats.avgVolume.toString(),
          upWinRate: stats.upWinRate,
          downWinRate: stats.downWinRate
        },
        recentRounds: recentRounds.map(round => ({
          roundId: round.roundId,
          startTime: round.startTime,
          endTime: round.endTime,
          participants: round.participantCount,
          totalVolume: (parseFloat(round.totalUpAmount) + parseFloat(round.totalDownAmount)).toString(),
          winningPosition: round.winningPosition
        })),
        timeframe
      };

      // Cache for 10 minutes
      await cacheService.set(cacheKey, JSON.stringify(result), 600);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Error fetching round stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch round statistics'
      });
    }
  })
);

/**
 * @route   GET /api/v1/stats/predictions
 * @desc    Get prediction statistics
 * @access  Public
 */
router.get('/predictions',
  asyncHandler(async (req, res) => {
    const timeframe = req.query.timeframe as string || '7d';

    try {
      const cacheKey = `prediction_stats:${timeframe}`;
      
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

      const predictionStats = await Prediction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPredictions: { $sum: 1 },
            totalVolume: { $sum: { $toDouble: '$amount' } },
            avgPredictionSize: { $avg: { $toDouble: '$amount' } },
            upPredictions: {
              $sum: {
                $cond: [{ $eq: ['$position', 'UP'] }, 1, 0]
              }
            },
            downPredictions: {
              $sum: {
                $cond: [{ $eq: ['$position', 'DOWN'] }, 1, 0]
              }
            },
            winningPredictions: {
              $sum: {
                $cond: [{ $eq: ['$isWinning', true] }, 1, 0]
              }
            },
            claimedRewards: {
              $sum: {
                $cond: [{ $eq: ['$claimed', true] }, 1, 0]
              }
            },
            totalPayouts: {
              $sum: {
                $cond: [
                  { $eq: ['$claimed', true] },
                  { $toDouble: '$payout' },
                  0
                ]
              }
            }
          }
        },
        {
          $addFields: {
            upPercentage: {
              $cond: [
                { $gt: ['$totalPredictions', 0] },
                { $multiply: [{ $divide: ['$upPredictions', '$totalPredictions'] }, 100] },
                0
              ]
            },
            downPercentage: {
              $cond: [
                { $gt: ['$totalPredictions', 0] },
                { $multiply: [{ $divide: ['$downPredictions', '$totalPredictions'] }, 100] },
                0
              ]
            },
            overallWinRate: {
              $cond: [
                { $gt: ['$totalPredictions', 0] },
                { $multiply: [{ $divide: ['$winningPredictions', '$totalPredictions'] }, 100] },
                0
              ]
            },
            claimRate: {
              $cond: [
                { $gt: ['$winningPredictions', 0] },
                { $multiply: [{ $divide: ['$claimedRewards', '$winningPredictions'] }, 100] },
                0
              ]
            }
          }
        }
      ]);

      const stats = predictionStats[0] || {
        totalPredictions: 0,
        totalVolume: 0,
        avgPredictionSize: 0,
        upPredictions: 0,
        downPredictions: 0,
        upPercentage: 0,
        downPercentage: 0,
        winningPredictions: 0,
        overallWinRate: 0,
        claimedRewards: 0,
        claimRate: 0,
        totalPayouts: 0
      };

      // Get prediction size distribution
      const sizeDistribution = await Prediction.aggregate([
        { $match: matchStage },
        {
          $bucket: {
            groupBy: { $toDouble: '$amount' },
            boundaries: [0, 10, 50, 100, 500, 1000, 5000, 100000],
            default: 'other',
            output: {
              count: { $sum: 1 },
              totalVolume: { $sum: { $toDouble: '$amount' } }
            }
          }
        }
      ]);

      const result = {
        summary: {
          totalPredictions: stats.totalPredictions,
          totalVolume: stats.totalVolume.toString(),
          avgPredictionSize: stats.avgPredictionSize.toString(),
          upPercentage: stats.upPercentage,
          downPercentage: stats.downPercentage,
          overallWinRate: stats.overallWinRate,
          claimRate: stats.claimRate,
          totalPayouts: stats.totalPayouts.toString()
        },
        distribution: {
          byPosition: {
            up: stats.upPredictions,
            down: stats.downPredictions
          },
          bySize: sizeDistribution
        },
        timeframe
      };

      // Cache for 10 minutes
      await cacheService.set(cacheKey, JSON.stringify(result), 600);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Error fetching prediction stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prediction statistics'
      });
    }
  })
);

/**
 * @route   GET /api/v1/stats/price
 * @desc    Get price statistics and history
 * @access  Public
 */
router.get('/price',
  asyncHandler(async (req, res) => {
    const hours = Math.min(parseInt(req.query.hours as string) || 24, 168); // Max 7 days

    try {
      const priceService = getPriceService();
      
      const [currentPrice, priceHistory, priceStats] = await Promise.all([
        priceService.getCurrentPrice(),
        priceService.getPriceHistory(hours),
        priceService.getPriceStats()
      ]);

      // Calculate additional metrics from history
      let volatility = 0;
      let priceChange = 0;
      
      if (priceHistory.length > 1) {
        const prices = priceHistory.map(p => p.price);
        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        
        priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
        
        // Calculate volatility (standard deviation)
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        volatility = Math.sqrt(variance);
      }

      res.json({
        success: true,
        data: {
          current: currentPrice,
          stats: priceStats,
          history: priceHistory,
          metrics: {
            priceChange,
            volatility,
            dataPoints: priceHistory.length,
            timeframe: `${hours}h`
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching price stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch price statistics'
      });
    }
  })
);

/**
 * @route   GET /api/v1/stats/blockchain
 * @desc    Get blockchain-related statistics
 * @access  Public
 */
router.get('/blockchain',
  asyncHandler(async (req, res) => {
    try {
      const cacheKey = 'blockchain_stats';
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      const web3Service = getWeb3Service();
      
      const [
        blockNumber,
        gasPrice,
        tokenTotalSupply,
        currentRoundId
      ] = await Promise.all([
        web3Service.getBlockNumber(),
        web3Service.getGasPrice(),
        web3Service.getTokenTotalSupply(),
        web3Service.getCurrentRoundId()
      ]);

      // Get current round data if exists
      let currentRound = null;
      if (currentRoundId > 0) {
        currentRound = await web3Service.getRoundData(currentRoundId);
      }

      const blockchainStats = {
        network: {
          blockNumber,
          gasPrice: gasPrice.toString(),
          chainId: process.env.CHAIN_ID || '8453'
        },
        token: {
          totalSupply: tokenTotalSupply,
          contractAddress: process.env.NEURAL_TOKEN_ADDRESS
        },
        predictionMarket: {
          contractAddress: process.env.PREDICTION_MARKET_ADDRESS,
          currentRoundId,
          currentRound
        },
        lastUpdated: new Date()
      };

      // Cache for 2 minutes
      await cacheService.set(cacheKey, JSON.stringify(blockchainStats), 120);

      res.json({
        success: true,
        data: blockchainStats
      });

    } catch (error) {
      logger.error('Error fetching blockchain stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blockchain statistics'
      });
    }
  })
);

export default router;
