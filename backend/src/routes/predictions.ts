import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken, AuthRequest } from '@/middleware/auth';
import { getWeb3Service } from '@/config/web3';
import Prediction from '@/models/Prediction';
import Round from '@/models/Round';
import User from '@/models/User';
import { logger } from '@/utils/logger';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const makePredictionSchema = Joi.object({
  roundId: Joi.number().integer().min(1).required(),
  position: Joi.string().valid('UP', 'DOWN').required(),
  amount: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  transactionHash: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required()
});

const claimRewardSchema = Joi.object({
  roundId: Joi.number().integer().min(1).required()
});

/**
 * @route   POST /api/v1/predictions
 * @desc    Record a new prediction
 * @access  Private
 */
router.post('/',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const { error } = makePredictionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { roundId, position, amount, transactionHash } = req.body;
    const userAddress = req.user!.address;

    try {
      // Check if round exists and is active
      const round = await Round.findOne({ roundId });
      if (!round) {
        return res.status(404).json({
          success: false,
          message: 'Round not found'
        });
      }

      if (round.state !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Round is not active for predictions'
        });
      }

      // Check if user already has a prediction for this round
      const existingPrediction = await Prediction.findUserPredictionForRound(userAddress, roundId);
      if (existingPrediction) {
        return res.status(409).json({
          success: false,
          message: 'You have already made a prediction for this round'
        });
      }

      // Validate amount limits
      const amountNum = parseFloat(amount);
      if (amountNum < 1 || amountNum > 100000) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be between 1 and 100,000 NEURAL tokens'
        });
      }

      // Create prediction record
      const prediction = new Prediction({
        user: userAddress,
        roundId,
        position,
        amount,
        transactionHash,
        predictedAt: new Date()
      });

      await prediction.save();

      // Update round statistics
      await round.updateParticipants(position as 'UP' | 'DOWN', true);

      // Update user statistics
      const user = await User.findByAddress(userAddress);
      if (user) {
        user.stats.totalStaked = (parseFloat(user.stats.totalStaked) + amountNum).toString();
        user.stats.totalRounds += 1;
        await user.save();
      }

      res.status(201).json({
        success: true,
        data: {
          prediction: {
            id: prediction._id,
            roundId: prediction.roundId,
            position: prediction.position,
            amount: prediction.amount,
            transactionHash: prediction.transactionHash,
            predictedAt: prediction.predictedAt
          }
        },
        message: 'Prediction recorded successfully'
      });

      logger.info(`Prediction made: ${userAddress} - ${position} ${amount} NEURAL for round ${roundId}`);

    } catch (error) {
      logger.error('Error recording prediction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record prediction'
      });
    }
  })
);

/**
 * @route   GET /api/v1/predictions
 * @desc    Get user's predictions
 * @access  Private
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userAddress = req.user!.address;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    try {
      const predictions = await Prediction.find({ user: userAddress })
        .sort({ predictedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('roundId', 'startTime lockTime endTime startPrice lockPrice endPrice state resolved winningPosition');

      const total = await Prediction.countDocuments({ user: userAddress });

      res.json({
        success: true,
        data: {
          predictions,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch predictions'
      });
    }
  })
);

/**
 * @route   GET /api/v1/predictions/:roundId
 * @desc    Get user's prediction for a specific round
 * @access  Private
 */
router.get('/:roundId',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const roundId = parseInt(req.params.roundId);
    const userAddress = req.user!.address;

    if (isNaN(roundId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid round ID'
      });
    }

    try {
      const prediction = await Prediction.findUserPredictionForRound(userAddress, roundId);

      if (!prediction) {
        return res.status(404).json({
          success: false,
          message: 'Prediction not found for this round'
        });
      }

      // Get claimable amount from blockchain if round is resolved
      const round = await Round.findOne({ roundId });
      let claimableAmount = '0';
      
      if (round && round.resolved && !prediction.claimed) {
        try {
          const web3Service = getWeb3Service();
          claimableAmount = await web3Service.getClaimableAmount(roundId, userAddress);
        } catch (error) {
          logger.error('Error getting claimable amount:', error);
        }
      }

      res.json({
        success: true,
        data: {
          prediction: {
            ...prediction.toJSON(),
            claimableAmount
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching prediction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prediction'
      });
    }
  })
);

/**
 * @route   POST /api/v1/predictions/:roundId/claim
 * @desc    Claim reward for a winning prediction
 * @access  Private
 */
router.post('/:roundId/claim',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const roundId = parseInt(req.params.roundId);
    const userAddress = req.user!.address;

    if (isNaN(roundId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid round ID'
      });
    }

    try {
      // Find the prediction
      const prediction = await Prediction.findUserPredictionForRound(userAddress, roundId);
      if (!prediction) {
        return res.status(404).json({
          success: false,
          message: 'Prediction not found for this round'
        });
      }

      // Check if already claimed
      if (prediction.claimed) {
        return res.status(400).json({
          success: false,
          message: 'Reward already claimed'
        });
      }

      // Check if round is resolved
      const round = await Round.findOne({ roundId });
      if (!round || !round.resolved) {
        return res.status(400).json({
          success: false,
          message: 'Round not yet resolved'
        });
      }

      // Check if prediction is winning
      if (prediction.position !== round.winningPosition) {
        return res.status(400).json({
          success: false,
          message: 'This prediction did not win'
        });
      }

      // Get claimable amount from blockchain
      const web3Service = getWeb3Service();
      const claimableAmount = await web3Service.getClaimableAmount(roundId, userAddress);
      
      if (parseFloat(claimableAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No rewards to claim'
        });
      }

      // Execute claim transaction on blockchain
      const tx = await web3Service.getPredictionMarket().claimReward(roundId);
      await tx.wait();

      // Update prediction record
      await prediction.markAsClaimed();
      prediction.payout = claimableAmount;
      await prediction.save();

      // Update user statistics
      const user = await User.findByAddress(userAddress);
      if (user) {
        user.stats.totalWinnings = (parseFloat(user.stats.totalWinnings) + parseFloat(claimableAmount)).toString();
        user.stats.wonRounds += 1;
        user.stats.currentWinStreak += 1;
        
        if (user.stats.currentWinStreak > user.stats.maxWinStreak) {
          user.stats.maxWinStreak = user.stats.currentWinStreak;
        }
        
        // Recalculate win rate and ROI
        user.stats.winRate = user.stats.totalRounds > 0 ? (user.stats.wonRounds / user.stats.totalRounds) * 100 : 0;
        user.stats.roi = parseFloat(user.stats.totalStaked) > 0 ? 
          ((parseFloat(user.stats.totalWinnings) - parseFloat(user.stats.totalStaked)) / parseFloat(user.stats.totalStaked)) * 100 : 0;
        
        await user.save();
      }

      res.json({
        success: true,
        data: {
          claimedAmount: claimableAmount,
          transactionHash: tx.hash
        },
        message: 'Reward claimed successfully'
      });

      logger.info(`Reward claimed: ${userAddress} - ${claimableAmount} NEURAL for round ${roundId}`);

    } catch (error) {
      logger.error('Error claiming reward:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to claim reward'
      });
    }
  })
);

/**
 * @route   GET /api/v1/predictions/unclaimed
 * @desc    Get user's unclaimed winning predictions
 * @access  Private
 */
router.get('/unclaimed',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userAddress = req.user!.address;

    try {
      const unclaimedPredictions = await Prediction.getUnclaimedPredictions(userAddress);
      
      // Get claimable amounts from blockchain
      const web3Service = getWeb3Service();
      const predictionsWithAmounts = await Promise.all(
        unclaimedPredictions.map(async (prediction) => {
          try {
            const claimableAmount = await web3Service.getClaimableAmount(prediction.roundId, userAddress);
            return {
              ...prediction.toJSON(),
              claimableAmount
            };
          } catch (error) {
            logger.error(`Error getting claimable amount for round ${prediction.roundId}:`, error);
            return {
              ...prediction.toJSON(),
              claimableAmount: '0'
            };
          }
        })
      );

      const totalClaimable = predictionsWithAmounts.reduce(
        (sum, pred) => sum + parseFloat(pred.claimableAmount || '0'), 
        0
      );

      res.json({
        success: true,
        data: {
          predictions: predictionsWithAmounts,
          totalClaimable: totalClaimable.toString()
        }
      });

    } catch (error) {
      logger.error('Error fetching unclaimed predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unclaimed predictions'
      });
    }
  })
);

/**
 * @route   GET /api/v1/predictions/stats
 * @desc    Get user's prediction statistics
 * @access  Private
 */
router.get('/stats',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const userAddress = req.user!.address;

    try {
      const stats = await Prediction.getUserStatistics(userAddress);
      
      res.json({
        success: true,
        data: stats[0] || {
          totalPredictions: 0,
          totalStaked: 0,
          totalWinnings: 0,
          winningPredictions: 0,
          upPredictions: 0,
          downPredictions: 0,
          winRate: 0,
          roi: 0
        }
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

export default router;
