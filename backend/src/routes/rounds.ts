import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { optionalAuth, AuthRequest } from '@/middleware/auth';
import { getWeb3Service } from '@/config/web3';
import { getPriceService } from '@/services/priceService';
import Round from '@/models/Round';
import Prediction from '@/models/Prediction';
import { logger } from '@/utils/logger';

const router = express.Router();

/**
 * @route   GET /api/v1/rounds/current
 * @desc    Get current active round
 * @access  Public
 */
router.get('/current',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const web3Service = getWeb3Service();
      const priceService = getPriceService();
      
      // Get current round from blockchain
      const currentRoundId = await web3Service.getCurrentRoundId();
      
      if (currentRoundId === 0) {
        return res.json({
          success: true,
          data: null,
          message: 'No active round'
        });
      }

      // Get round data from blockchain and database
      const [blockchainRound, dbRound] = await Promise.all([
        web3Service.getRoundData(currentRoundId),
        Round.findOne({ roundId: currentRoundId })
      ]);

      // Get current price
      const currentPrice = await priceService.getCurrentPrice();
      
      // Get user's prediction if authenticated
      let userPrediction = null;
      if (req.user) {
        userPrediction = await Prediction.findUserPredictionForRound(req.user.address, currentRoundId);
      }

      // Get round statistics
      const roundStats = await Prediction.getRoundStatistics(currentRoundId);
      
      const upStats = roundStats.find(stat => stat._id === 'UP') || { count: 0, totalAmount: 0, avgAmount: 0 };
      const downStats = roundStats.find(stat => stat._id === 'DOWN') || { count: 0, totalAmount: 0, avgAmount: 0 };

      const totalAmount = upStats.totalAmount + downStats.totalAmount;
      const totalParticipants = upStats.count + downStats.count;

      res.json({
        success: true,
        data: {
          round: {
            roundId: currentRoundId,
            startTime: blockchainRound.startTime,
            lockTime: blockchainRound.lockTime,
            endTime: blockchainRound.endTime,
            startPrice: blockchainRound.startPrice,
            lockPrice: blockchainRound.lockPrice,
            endPrice: blockchainRound.endPrice,
            state: blockchainRound.state,
            resolved: blockchainRound.resolved,
            totalUpAmount: blockchainRound.totalUpAmount,
            totalDownAmount: blockchainRound.totalDownAmount,
            rewardAmount: blockchainRound.rewardAmount
          },
          currentPrice: currentPrice?.price || '0',
          priceChange24h: currentPrice?.change24h || 0,
          statistics: {
            totalAmount,
            totalParticipants,
            upAmount: upStats.totalAmount,
            downAmount: downStats.totalAmount,
            upParticipants: upStats.count,
            downParticipants: downStats.count,
            upPercentage: totalAmount > 0 ? (upStats.totalAmount / totalAmount) * 100 : 0,
            downPercentage: totalAmount > 0 ? (downStats.totalAmount / totalAmount) * 100 : 0
          },
          userPrediction: userPrediction ? {
            position: userPrediction.position,
            amount: userPrediction.amount,
            predictedAt: userPrediction.predictedAt
          } : null,
          timeRemaining: {
            toLock: Math.max(0, blockchainRound.lockTime - Math.floor(Date.now() / 1000)),
            toEnd: Math.max(0, blockchainRound.endTime - Math.floor(Date.now() / 1000))
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching current round:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current round'
      });
    }
  })
);

/**
 * @route   GET /api/v1/rounds/:roundId
 * @desc    Get specific round details
 * @access  Public
 */
router.get('/:roundId',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const roundId = parseInt(req.params.roundId);

    if (isNaN(roundId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid round ID'
      });
    }

    try {
      const web3Service = getWeb3Service();
      
      // Get round data from blockchain
      const blockchainRound = await web3Service.getRoundData(roundId);
      
      // Get round from database for additional metadata
      const dbRound = await Round.findOne({ roundId });

      // Get user's prediction if authenticated
      let userPrediction = null;
      if (req.user) {
        userPrediction = await Prediction.findUserPredictionForRound(req.user.address, roundId);
      }

      // Get round statistics
      const roundStats = await Prediction.getRoundStatistics(roundId);
      
      const upStats = roundStats.find(stat => stat._id === 'UP') || { count: 0, totalAmount: 0, avgAmount: 0 };
      const downStats = roundStats.find(stat => stat._id === 'DOWN') || { count: 0, totalAmount: 0, avgAmount: 0 };

      const totalAmount = upStats.totalAmount + downStats.totalAmount;
      const totalParticipants = upStats.count + downStats.count;

      res.json({
        success: true,
        data: {
          round: {
            roundId,
            startTime: blockchainRound.startTime,
            lockTime: blockchainRound.lockTime,
            endTime: blockchainRound.endTime,
            startPrice: blockchainRound.startPrice,
            lockPrice: blockchainRound.lockPrice,
            endPrice: blockchainRound.endPrice,
            state: blockchainRound.state,
            resolved: blockchainRound.resolved,
            totalUpAmount: blockchainRound.totalUpAmount,
            totalDownAmount: blockchainRound.totalDownAmount,
            rewardAmount: blockchainRound.rewardAmount,
            winningPosition: blockchainRound.endPrice && blockchainRound.lockPrice ? 
              (parseFloat(blockchainRound.endPrice) > parseFloat(blockchainRound.lockPrice) ? 'UP' : 'DOWN') : null
          },
          statistics: {
            totalAmount,
            totalParticipants,
            upAmount: upStats.totalAmount,
            downAmount: downStats.totalAmount,
            upParticipants: upStats.count,
            downParticipants: downStats.count,
            upPercentage: totalAmount > 0 ? (upStats.totalAmount / totalAmount) * 100 : 0,
            downPercentage: totalAmount > 0 ? (downStats.totalAmount / totalAmount) * 100 : 0,
            avgUpAmount: upStats.avgAmount,
            avgDownAmount: downStats.avgAmount
          },
          userPrediction: userPrediction ? {
            position: userPrediction.position,
            amount: userPrediction.amount,
            predictedAt: userPrediction.predictedAt,
            claimed: userPrediction.claimed,
            claimableAmount: userPrediction.claimableAmount,
            isWinning: userPrediction.isWinning
          } : null,
          priceHistory: dbRound?.priceHistory || []
        }
      });

    } catch (error) {
      logger.error('Error fetching round details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch round details'
      });
    }
  })
);

/**
 * @route   GET /api/v1/rounds
 * @desc    Get rounds history
 * @access  Public
 */
router.get('/',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    try {
      let query: any = {};
      
      if (status) {
        if (status === 'active') {
          query.state = 'ACTIVE';
        } else if (status === 'locked') {
          query.state = 'LOCKED';
        } else if (status === 'resolved') {
          query.resolved = true;
        }
      }

      const rounds = await Round.find(query)
        .sort({ roundId: -1 })
        .skip(skip)
        .limit(limit)
        .select('-priceHistory'); // Exclude price history for list view

      const total = await Round.countDocuments(query);

      // Get statistics for each round
      const roundsWithStats = await Promise.all(
        rounds.map(async (round) => {
          const roundStats = await Prediction.getRoundStatistics(round.roundId);
          
          const upStats = roundStats.find(stat => stat._id === 'UP') || { count: 0, totalAmount: 0 };
          const downStats = roundStats.find(stat => stat._id === 'DOWN') || { count: 0, totalAmount: 0 };

          return {
            ...round.toJSON(),
            statistics: {
              totalAmount: upStats.totalAmount + downStats.totalAmount,
              totalParticipants: upStats.count + downStats.count,
              upAmount: upStats.totalAmount,
              downAmount: downStats.totalAmount,
              upParticipants: upStats.count,
              downParticipants: downStats.count
            }
          };
        })
      );

      res.json({
        success: true,
        data: {
          rounds: roundsWithStats,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching rounds:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rounds'
      });
    }
  })
);

/**
 * @route   GET /api/v1/rounds/:roundId/predictions
 * @desc    Get predictions for a specific round
 * @access  Public
 */
router.get('/:roundId/predictions',
  asyncHandler(async (req, res) => {
    const roundId = parseInt(req.params.roundId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;
    const position = req.query.position as string;

    if (isNaN(roundId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid round ID'
      });
    }

    try {
      let query: any = { roundId };
      
      if (position && ['UP', 'DOWN'].includes(position)) {
        query.position = position;
      }

      const predictions = await Prediction.find(query)
        .sort({ amount: -1, predictedAt: 1 }) // Sort by amount descending, then by time
        .skip(skip)
        .limit(limit)
        .select('user position amount predictedAt claimed isWinning');

      const total = await Prediction.countDocuments(query);

      // Anonymize user addresses for privacy (show only first 6 and last 4 characters)
      const anonymizedPredictions = predictions.map(pred => ({
        ...pred.toJSON(),
        user: `${pred.user.substring(0, 6)}...${pred.user.substring(pred.user.length - 4)}`
      }));

      res.json({
        success: true,
        data: {
          predictions: anonymizedPredictions,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching round predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch round predictions'
      });
    }
  })
);

/**
 * @route   GET /api/v1/rounds/price-history
 * @desc    Get price history for charts
 * @access  Public
 */
router.get('/price-history',
  asyncHandler(async (req, res) => {
    const hours = Math.min(parseInt(req.query.hours as string) || 24, 168); // Max 7 days

    try {
      const priceService = getPriceService();
      const priceHistory = await priceService.getPriceHistory(hours);

      res.json({
        success: true,
        data: {
          priceHistory,
          hours
        }
      });

    } catch (error) {
      logger.error('Error fetching price history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch price history'
      });
    }
  })
);

export default router;
