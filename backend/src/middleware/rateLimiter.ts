import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient } from '@/config/redis';
import { logger } from '@/utils/logger';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

let rateLimiter: RateLimiterRedis;

// Initialize rate limiter with Redis
const initRateLimiter = () => {
  try {
    const redisClient = getRedisClient();
    
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'neureal_rl',
      points: MAX_REQUESTS, // Number of requests
      duration: Math.floor(WINDOW_MS / 1000), // Per duration in seconds
      blockDuration: Math.floor(WINDOW_MS / 1000), // Block for duration in seconds
      execEvenly: true, // Spread requests evenly across duration
    });
    
    logger.info('Rate limiter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize rate limiter:', error);
    // Fallback to in-memory rate limiter if Redis is not available
    rateLimiter = new RateLimiterRedis({
      storeClient: undefined, // This will use in-memory store
      keyPrefix: 'neureal_rl_mem',
      points: MAX_REQUESTS,
      duration: Math.floor(WINDOW_MS / 1000),
      blockDuration: Math.floor(WINDOW_MS / 1000),
    });
  }
};

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!rateLimiter) {
    initRateLimiter();
  }

  try {
    // Use IP address as key, but could also use user ID if authenticated
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: secs
    });
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
  }
};

// Specific rate limiter for authentication endpoints
export const authRateLimiter = new RateLimiterRedis({
  storeClient: undefined, // Will be set when Redis is available
  keyPrefix: 'neureal_auth_rl',
  points: 5, // 5 attempts
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes
});

export const authRateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    await authRateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      retryAfter: secs
    });
    
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
  }
};

// Export the main rate limiter
export const rateLimiter = rateLimiterMiddleware;
