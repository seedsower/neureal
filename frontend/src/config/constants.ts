// Environment variables with fallbacks
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3002';

// Contract addresses (these should be set after deployment)
export const NEURAL_TOKEN_ADDRESS = process.env.REACT_APP_NEURAL_TOKEN_ADDRESS || '';
export const PREDICTION_MARKET_ADDRESS = process.env.REACT_APP_PREDICTION_MARKET_ADDRESS || '';

// Chain configuration
export const SUPPORTED_CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID || '8453'); // Base mainnet
export const CHAIN_NAME = process.env.REACT_APP_CHAIN_NAME || 'Base';

// Token configuration
export const NEURAL_TOKEN_DECIMALS = 18;
export const NEURAL_TOKEN_SYMBOL = 'NEURAL';
export const MIN_PREDICTION_AMOUNT = 1;
export const MAX_PREDICTION_AMOUNT = 100000;

// Round configuration
export const ROUND_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const LOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// UI configuration
export const REFRESH_INTERVAL = 30000; // 30 seconds
export const PRICE_UPDATE_INTERVAL = 10000; // 10 seconds
export const CHART_UPDATE_INTERVAL = 60000; // 1 minute

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'neureal-theme',
  WALLET_CONNECTED: 'neureal-wallet-connected',
  USER_PREFERENCES: 'neureal-user-preferences',
  TUTORIAL_COMPLETED: 'neureal-tutorial-completed',
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient NEURAL token balance',
  INVALID_AMOUNT: 'Please enter a valid amount',
  ROUND_NOT_ACTIVE: 'This round is not accepting predictions',
  ALREADY_PREDICTED: 'You have already made a prediction for this round',
  NETWORK_ERROR: 'Network error. Please try again.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please connect your wallet.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PREDICTION_MADE: 'Prediction submitted successfully!',
  REWARD_CLAIMED: 'Reward claimed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PREFERENCES_SAVED: 'Preferences saved successfully!',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  PREDICT: '/predict',
  PORTFOLIO: '/portfolio',
  LEADERBOARD: '/leaderboard',
  STATS: '/stats',
  PROFILE: '/profile',
  HELP: '/help',
} as const;

// External links
export const EXTERNAL_LINKS = {
  DOCS: 'https://docs.neureal.app',
  GITHUB: 'https://github.com/neureal/neureal-app',
  TWITTER: 'https://twitter.com/neurealapp',
  DISCORD: 'https://discord.gg/neureal',
  TELEGRAM: 'https://t.me/neureal',
  MEDIUM: 'https://medium.com/@neureal',
} as const;

// Chart configuration
export const CHART_CONFIG = {
  COLORS: {
    UP: '#22c55e',
    DOWN: '#ef4444',
    NEUTRAL: '#64748b',
    PRIMARY: '#8b5cf6',
    SECONDARY: '#d946ef',
  },
  GRADIENTS: {
    UP: ['#22c55e', '#16a34a'],
    DOWN: ['#ef4444', '#dc2626'],
    PRIMARY: ['#8b5cf6', '#7c3aed'],
  },
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// WebSocket events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PRICE_UPDATE: 'price_update',
  ROUND_STARTED: 'round_started',
  ROUND_LOCKED: 'round_locked',
  ROUND_RESOLVED: 'round_resolved',
  PREDICTION_MADE: 'prediction_made',
  REWARD_CLAIMED: 'reward_claimed',
  USER_DATA: 'user_data',
  NOTIFICATION: 'notification',
  ERROR: 'error',
} as const;

// Position types
export const POSITIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
} as const;

// Round states
export const ROUND_STATES = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
} as const;

// Leaderboard types
export const LEADERBOARD_TYPES = {
  TOP_WINNERS: 'top-winners',
  WIN_RATE: 'win-rate',
  WIN_STREAK: 'win-streak',
  VOLUME: 'volume',
  ROI: 'roi',
} as const;

// Time periods
export const TIME_PERIODS = {
  '7D': '7d',
  '30D': '30d',
  'ALL': 'all',
} as const;
