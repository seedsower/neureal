import { ethers } from 'ethers';
import { logger } from '@/utils/logger';

// Contract ABIs (simplified for key functions)
export const NEURAL_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const PREDICTION_MARKET_ABI = [
  "function currentRoundId() view returns (uint256)",
  "function rounds(uint256) view returns (uint256 roundId, uint256 startTime, uint256 lockTime, uint256 endTime, uint256 startPrice, uint256 lockPrice, uint256 endPrice, uint256 totalUpAmount, uint256 totalDownAmount, uint256 rewardBaseCalAmount, uint256 rewardAmount, uint8 state, bool resolved)",
  "function predictions(uint256, address) view returns (uint8 position, uint256 amount, bool claimed, uint256 claimableAmount)",
  "function userStats(address) view returns (uint256 totalStaked, uint256 totalWinnings, uint256 currentWinStreak, uint256 maxWinStreak, uint256 totalRounds, uint256 wonRounds)",
  "function getUserRounds(address) view returns (uint256[])",
  "function getClaimableAmount(uint256, address) view returns (uint256)",
  "function predict(uint8 position, uint256 amount)",
  "function claimReward(uint256 roundId)",
  "function startRound(uint256 startPrice)",
  "function lockRound(uint256 lockPrice)",
  "function resolveRound(uint256 endPrice)",
  "event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 lockTime, uint256 endTime)",
  "event RoundLocked(uint256 indexed roundId, uint256 lockPrice)",
  "event RoundResolved(uint256 indexed roundId, uint256 endPrice, uint8 winningPosition)",
  "event PredictionMade(address indexed user, uint256 indexed roundId, uint8 position, uint256 amount)",
  "event RewardClaimed(address indexed user, uint256 indexed roundId, uint256 amount)"
];

class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private neuralToken: ethers.Contract;
  private predictionMarket: ethers.Contract;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const neuralTokenAddress = process.env.NEURAL_TOKEN_ADDRESS;
    const predictionMarketAddress = process.env.PREDICTION_MARKET_ADDRESS;

    if (!rpcUrl || !privateKey || !neuralTokenAddress || !predictionMarketAddress) {
      throw new Error('Missing required Web3 configuration');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    this.neuralToken = new ethers.Contract(
      neuralTokenAddress,
      NEURAL_TOKEN_ABI,
      this.wallet
    );
    
    this.predictionMarket = new ethers.Contract(
      predictionMarketAddress,
      PREDICTION_MARKET_ABI,
      this.wallet
    );

    logger.info('Web3 service initialized successfully');
  }

  // Provider methods
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  getWallet(): ethers.Wallet {
    return this.wallet;
  }

  // Contract getters
  getNeuralToken(): ethers.Contract {
    return this.neuralToken;
  }

  getPredictionMarket(): ethers.Contract {
    return this.predictionMarket;
  }

  // Utility methods
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getGasPrice(): Promise<bigint> {
    return await this.provider.getFeeData().then(fee => fee.gasPrice || 0n);
  }

  async estimateGas(transaction: any): Promise<bigint> {
    return await this.provider.estimateGas(transaction);
  }

  // Token methods
  async getTokenBalance(address: string): Promise<string> {
    const balance = await this.neuralToken.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async getTokenTotalSupply(): Promise<string> {
    const supply = await this.neuralToken.totalSupply();
    return ethers.formatEther(supply);
  }

  // Prediction market methods
  async getCurrentRoundId(): Promise<number> {
    const roundId = await this.predictionMarket.currentRoundId();
    return Number(roundId);
  }

  async getRoundData(roundId: number) {
    const round = await this.predictionMarket.rounds(roundId);
    return {
      roundId: Number(round.roundId),
      startTime: Number(round.startTime),
      lockTime: Number(round.lockTime),
      endTime: Number(round.endTime),
      startPrice: ethers.formatEther(round.startPrice),
      lockPrice: ethers.formatEther(round.lockPrice),
      endPrice: ethers.formatEther(round.endPrice),
      totalUpAmount: ethers.formatEther(round.totalUpAmount),
      totalDownAmount: ethers.formatEther(round.totalDownAmount),
      rewardAmount: ethers.formatEther(round.rewardAmount),
      state: Number(round.state),
      resolved: round.resolved
    };
  }

  async getUserPrediction(roundId: number, userAddress: string) {
    const prediction = await this.predictionMarket.predictions(roundId, userAddress);
    return {
      position: Number(prediction.position),
      amount: ethers.formatEther(prediction.amount),
      claimed: prediction.claimed,
      claimableAmount: ethers.formatEther(prediction.claimableAmount)
    };
  }

  async getUserStats(userAddress: string) {
    const stats = await this.predictionMarket.userStats(userAddress);
    return {
      totalStaked: ethers.formatEther(stats.totalStaked),
      totalWinnings: ethers.formatEther(stats.totalWinnings),
      currentWinStreak: Number(stats.currentWinStreak),
      maxWinStreak: Number(stats.maxWinStreak),
      totalRounds: Number(stats.totalRounds),
      wonRounds: Number(stats.wonRounds)
    };
  }

  async getUserRounds(userAddress: string): Promise<number[]> {
    const rounds = await this.predictionMarket.getUserRounds(userAddress);
    return rounds.map((r: any) => Number(r));
  }

  async getClaimableAmount(roundId: number, userAddress: string): Promise<string> {
    const amount = await this.predictionMarket.getClaimableAmount(roundId, userAddress);
    return ethers.formatEther(amount);
  }

  // Admin methods (for oracle operations)
  async startRound(startPrice: string): Promise<ethers.TransactionResponse> {
    const priceInWei = ethers.parseEther(startPrice);
    return await this.predictionMarket.startRound(priceInWei);
  }

  async lockRound(lockPrice: string): Promise<ethers.TransactionResponse> {
    const priceInWei = ethers.parseEther(lockPrice);
    return await this.predictionMarket.lockRound(priceInWei);
  }

  async resolveRound(endPrice: string): Promise<ethers.TransactionResponse> {
    const priceInWei = ethers.parseEther(endPrice);
    return await this.predictionMarket.resolveRound(priceInWei);
  }

  // Event listeners
  setupEventListeners(callback: (event: any) => void) {
    // Listen to prediction market events
    this.predictionMarket.on('RoundStarted', (roundId, startTime, lockTime, endTime, event) => {
      callback({
        type: 'RoundStarted',
        data: { roundId: Number(roundId), startTime: Number(startTime), lockTime: Number(lockTime), endTime: Number(endTime) },
        event
      });
    });

    this.predictionMarket.on('RoundLocked', (roundId, lockPrice, event) => {
      callback({
        type: 'RoundLocked',
        data: { roundId: Number(roundId), lockPrice: ethers.formatEther(lockPrice) },
        event
      });
    });

    this.predictionMarket.on('RoundResolved', (roundId, endPrice, winningPosition, event) => {
      callback({
        type: 'RoundResolved',
        data: { roundId: Number(roundId), endPrice: ethers.formatEther(endPrice), winningPosition: Number(winningPosition) },
        event
      });
    });

    this.predictionMarket.on('PredictionMade', (user, roundId, position, amount, event) => {
      callback({
        type: 'PredictionMade',
        data: { user, roundId: Number(roundId), position: Number(position), amount: ethers.formatEther(amount) },
        event
      });
    });

    this.predictionMarket.on('RewardClaimed', (user, roundId, amount, event) => {
      callback({
        type: 'RewardClaimed',
        data: { user, roundId: Number(roundId), amount: ethers.formatEther(amount) },
        event
      });
    });

    logger.info('Web3 event listeners set up successfully');
  }
}

// Singleton instance
let web3Service: Web3Service;

export const getWeb3Service = (): Web3Service => {
  if (!web3Service) {
    web3Service = new Web3Service();
  }
  return web3Service;
};

export { Web3Service };
