import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateAddress, generateAuthMessage, verifySignature, generateToken } from '@/middleware/auth';
import { authRateLimiterMiddleware } from '@/middleware/rateLimiter';
import User from '@/models/User';
import { logger } from '@/utils/logger';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const getNonceSchema = Joi.object({
  address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
});

const verifySignatureSchema = Joi.object({
  address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  signature: Joi.string().pattern(/^0x[a-fA-F0-9]{130}$/).required(),
  nonce: Joi.string().required()
});

/**
 * @route   POST /api/v1/auth/nonce
 * @desc    Get nonce for wallet authentication
 * @access  Public
 */
router.post('/nonce', 
  authRateLimiterMiddleware,
  validateAddress,
  asyncHandler(async (req, res) => {
    const { error } = getNonceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { address } = req.body;

    try {
      // Find or create user
      let user = await User.findByAddress(address);
      
      if (!user) {
        user = new User({
          address: address.toLowerCase(),
          nonce: Math.floor(Math.random() * 1000000).toString()
        });
        await user.save();
        logger.info(`New user created: ${address}`);
      } else {
        // Generate new nonce for existing user
        user.generateNonce();
        await user.save();
      }

      res.json({
        success: true,
        data: {
          nonce: user.nonce,
          message: generateAuthMessage(address, user.nonce)
        }
      });

    } catch (error) {
      logger.error('Error in nonce generation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate nonce'
      });
    }
  })
);

/**
 * @route   POST /api/v1/auth/verify
 * @desc    Verify signature and authenticate user
 * @access  Public
 */
router.post('/verify',
  authRateLimiterMiddleware,
  validateAddress,
  asyncHandler(async (req, res) => {
    const { error } = verifySignatureSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { address, signature, nonce } = req.body;

    try {
      // Find user
      const user = await User.findByAddress(address);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please request a nonce first.'
        });
      }

      // Verify nonce
      if (user.nonce !== nonce) {
        return res.status(400).json({
          success: false,
          message: 'Invalid nonce. Please request a new nonce.'
        });
      }

      // Verify signature
      const message = generateAuthMessage(address, nonce);
      const isValidSignature = verifySignature(message, signature, address);

      if (!isValidSignature) {
        return res.status(401).json({
          success: false,
          message: 'Invalid signature'
        });
      }

      // Generate new nonce for security
      user.generateNonce();
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(address);

      res.json({
        success: true,
        data: {
          token,
          user: {
            address: user.address,
            username: user.username,
            avatar: user.avatar,
            stats: user.stats,
            preferences: user.preferences,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
          }
        }
      });

      logger.info(`User authenticated: ${address}`);

    } catch (error) {
      logger.error('Error in signature verification:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  })
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh',
  authRateLimiterMiddleware,
  asyncHandler(async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token required'
      });
    }

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }) as any;
      
      // Check if user still exists
      const user = await User.findByAddress(decoded.address);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Generate new token
      const newToken = generateToken(decoded.address);

      res.json({
        success: true,
        data: {
          token: newToken,
          user: {
            address: user.address,
            username: user.username,
            avatar: user.avatar,
            stats: user.stats,
            preferences: user.preferences,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
          }
        }
      });

    } catch (error) {
      logger.error('Error refreshing token:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  })
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token required'
      });
    }

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      
      const user = await User.findByAddress(decoded.address);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

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
      logger.error('Error getting user info:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  })
);

export default router;
