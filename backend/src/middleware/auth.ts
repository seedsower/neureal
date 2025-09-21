import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { logger } from '@/utils/logger';

export interface AuthRequest extends Request {
  user?: {
    address: string;
    iat?: number;
    exp?: number;
  };
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const generateToken = (address: string): string => {
  return jwt.sign(
    { address: address.toLowerCase() },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const verifySignature = (message: string, signature: string, expectedAddress: string): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    logger.error('Signature verification failed:', error);
    return false;
  }
};

export const generateAuthMessage = (address: string, nonce: string): string => {
  return `Welcome to Neureal!

Click to sign in and accept the Neureal Terms of Service.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address:
${address}

Nonce:
${nonce}`;
};

// Middleware to validate Ethereum address format
export const validateAddress = (req: Request, res: Response, next: NextFunction) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Wallet address is required'
    });
  }

  if (!ethers.isAddress(address)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Ethereum address format'
    });
  }

  // Normalize address to lowercase
  req.body.address = address.toLowerCase();
  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
  } catch (error) {
    // Token is invalid but we don't fail the request
    logger.warn('Optional auth failed:', error);
  }

  next();
};
