// User types
export interface User {
  address: string;
  username?: string;
  avatar?: string;
  bio?: string;
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserStats {
  totalStaked: string;
  totalWinnings: string;
  currentWinStreak: number;
  maxWinStreak: number;
  totalRounds: number;
  wonRounds: number;
  winRate: number;
  roi: number;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    roundStart: boolean;
    roundEnd: boolean;
    winnings: boolean;
  };
  theme: 'dark' | 'light';
  currency: 'USD' | 'ETH' | 'NEURAL';
}

// Round types
export interface Round {
  roundId: number;
  startTime: number;
  lockTime: number;
  endTime: number;
  startPrice: string;
  lockPrice?: string;
  endPrice?: string;
  totalUpAmount: string;
  totalDownAmount: string;
  rewardAmount: string;
  state: RoundState;
  resolved: boolean;
  winningPosition?: Position;
  timeRemaining?: {
    toLock: number;
    toEnd: number;
  };
  statistics?: {
    totalParticipants: number;
    averageStake: string;
  };
}

export type RoundState = 'ACTIVE' | 'LOCKED' | 'RESOLVED' | 'CANCELLED';
export type Position = 'UP' | 'DOWN';

// Prediction types
export interface Prediction {
  id: string;
  user: string;
  roundId: number;
  position: Position;
  amount: string;
  claimed: boolean;
  claimableAmount: string;
  predictedAt: string;
  claimedAt?: string;
  isWinning?: boolean;
  payout?: string;
  transactionHash: string;
}

// Price types
export interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface PriceStats {
  current: number;
  high24h: number;
  low24h: number;
  change24h: number;
  volume24h: number;
}

// Statistics types
export interface PlatformStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRounds: number;
    activeRounds: number;
    totalPredictions: number;
    totalVolume: string;
    avgParticipants: number;
  };
  daily: {
    newUsers: number;
    predictions: number;
    volume: string;
  };
  price: PriceStats;
  lastUpdated: string;
}

export interface RoundStatistics {
  totalAmount: number;
  totalParticipants: number;
  upAmount: number;
  downAmount: number;
  upParticipants: number;
  downParticipants: number;
  upPercentage: number;
  downPercentage: number;
  avgUpAmount?: number;
  avgDownAmount?: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  address: string;
  username?: string;
  avatar?: string;
  totalWinnings?: string;
  totalStaked?: string;
  winCount?: number;
  roi?: number;
  winRate?: number;
  currentWinStreak?: number;
  maxWinStreak?: number;
  totalVolume?: string;
  predictionCount?: number;
  avgPredictionSize?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  cached?: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

export interface PriceUpdateMessage {
  price: string;
  change24h: number;
  timestamp: number;
}

export interface RoundUpdateMessage {
  roundId: number;
  state: RoundState;
  lockPrice?: string;
  endPrice?: string;
  winningPosition?: Position;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read?: boolean;
}

// Form types
export interface PredictionFormData {
  position: Position;
  amount: string;
}

export interface ProfileFormData {
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface PreferencesFormData {
  notifications: {
    email: boolean;
    push: boolean;
    roundStart: boolean;
    roundEnd: boolean;
    winnings: boolean;
  };
  theme: 'dark' | 'light';
  currency: 'USD' | 'ETH' | 'NEURAL';
}

// Chart types
export interface ChartDataPoint {
  x: number | string;
  y: number;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  options?: any;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

// Transaction types
export interface Transaction {
  hash: string;
  type: 'prediction' | 'claim' | 'approve';
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  amount?: string;
  roundId?: number;
  position?: Position;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Theme types
export type Theme = 'dark' | 'light';

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Hook return types
export interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseWebSocketResult {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  subscribe: (rooms: string[]) => void;
  unsubscribe: (rooms: string[]) => void;
}

// Contract types
export interface ContractConfig {
  address: string;
  abi: any[];
}

export interface TokenBalance {
  formatted: string;
  decimals: number;
  symbol: string;
  value: bigint;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
  external?: boolean;
}

// Filter types
export interface FilterOptions {
  timeframe?: '7d' | '30d' | 'all';
  position?: Position;
  status?: 'active' | 'resolved' | 'won' | 'lost' | 'claimed' | 'unclaimed';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search types
export interface SearchResult {
  type: 'user' | 'round' | 'prediction';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

// Notification preferences
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  roundStart: boolean;
  roundEnd: boolean;
  winnings: boolean;
  marketing: boolean;
}

// Portfolio types
export interface Portfolio {
  balance: {
    available: string;
    staked: string;
    unclaimed: string;
  };
  stats: UserStats;
  activePrediction?: {
    roundId: number;
    position: Position;
    amount: string;
    predictedAt: string;
  };
  unclaimedRewards: Array<{
    roundId: number;
    amount: string;
    position: Position;
    stakedAmount: string;
  }>;
}
