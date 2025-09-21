import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/utils/logger';
import { getWeb3Service } from '@/config/web3';
import { cacheService } from '@/config/redis';
import Round from '@/models/Round';
import Prediction from '@/models/Prediction';
import User from '@/models/User';

interface ConnectedUser {
  address?: string;
  socketId: string;
  joinedAt: Date;
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private roomSubscriptions: Map<string, Set<string>> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
    this.setupWeb3EventListeners();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      
      this.connectedUsers.set(socket.id, {
        socketId: socket.id,
        joinedAt: new Date()
      });

      // Handle user authentication
      socket.on('authenticate', async (data) => {
        try {
          const { address } = data;
          if (address) {
            const user = this.connectedUsers.get(socket.id);
            if (user) {
              user.address = address.toLowerCase();
              this.connectedUsers.set(socket.id, user);
              
              // Join user-specific room
              socket.join(`user:${address.toLowerCase()}`);
              
              // Send user's current data
              await this.sendUserData(socket, address);
              
              logger.info(`User authenticated: ${address} (${socket.id})`);
            }
          }
        } catch (error) {
          logger.error('Authentication error:', error);
          socket.emit('error', { message: 'Authentication failed' });
        }
      });

      // Handle room subscriptions
      socket.on('subscribe', (data) => {
        try {
          const { rooms } = data;
          if (Array.isArray(rooms)) {
            rooms.forEach(room => {
              socket.join(room);
              
              if (!this.roomSubscriptions.has(room)) {
                this.roomSubscriptions.set(room, new Set());
              }
              this.roomSubscriptions.get(room)?.add(socket.id);
              
              logger.debug(`Socket ${socket.id} subscribed to room: ${room}`);
            });
          }
        } catch (error) {
          logger.error('Subscription error:', error);
        }
      });

      // Handle unsubscribe
      socket.on('unsubscribe', (data) => {
        try {
          const { rooms } = data;
          if (Array.isArray(rooms)) {
            rooms.forEach(room => {
              socket.leave(room);
              this.roomSubscriptions.get(room)?.delete(socket.id);
              
              logger.debug(`Socket ${socket.id} unsubscribed from room: ${room}`);
            });
          }
        } catch (error) {
          logger.error('Unsubscription error:', error);
        }
      });

      // Handle ping for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        
        // Clean up user data
        this.connectedUsers.delete(socket.id);
        
        // Clean up room subscriptions
        this.roomSubscriptions.forEach((sockets, room) => {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.roomSubscriptions.delete(room);
          }
        });
      });
    });
  }

  private setupWeb3EventListeners() {
    try {
      const web3Service = getWeb3Service();
      
      web3Service.setupEventListeners(async (event) => {
        logger.info('Blockchain event received:', event.type);
        
        switch (event.type) {
          case 'RoundStarted':
            await this.handleRoundStarted(event.data);
            break;
          case 'RoundLocked':
            await this.handleRoundLocked(event.data);
            break;
          case 'RoundResolved':
            await this.handleRoundResolved(event.data);
            break;
          case 'PredictionMade':
            await this.handlePredictionMade(event.data);
            break;
          case 'RewardClaimed':
            await this.handleRewardClaimed(event.data);
            break;
        }
      });
    } catch (error) {
      logger.error('Failed to setup Web3 event listeners:', error);
    }
  }

  private async sendUserData(socket: any, address: string) {
    try {
      const web3Service = getWeb3Service();
      
      // Get user stats from blockchain
      const userStats = await web3Service.getUserStats(address);
      const userRounds = await web3Service.getUserRounds(address);
      
      // Get user's recent predictions
      const predictions = await Prediction.findByUser(address, 10);
      
      socket.emit('user_data', {
        stats: userStats,
        rounds: userRounds,
        predictions: predictions
      });
    } catch (error) {
      logger.error('Error sending user data:', error);
    }
  }

  // Event handlers for blockchain events
  private async handleRoundStarted(data: any) {
    try {
      // Update database
      const round = new Round({
        roundId: data.roundId,
        startTime: new Date(data.startTime * 1000),
        lockTime: new Date(data.lockTime * 1000),
        endTime: new Date(data.endTime * 1000),
        startPrice: '0', // Will be updated with actual price
        state: 'ACTIVE'
      });
      
      await round.save();
      
      // Broadcast to all clients
      this.io.emit('round_started', {
        roundId: data.roundId,
        startTime: data.startTime,
        lockTime: data.lockTime,
        endTime: data.endTime
      });
      
      logger.info(`Round ${data.roundId} started and broadcasted`);
    } catch (error) {
      logger.error('Error handling round started:', error);
    }
  }

  private async handleRoundLocked(data: any) {
    try {
      // Update database
      await Round.findOneAndUpdate(
        { roundId: data.roundId },
        { 
          lockPrice: data.lockPrice,
          state: 'LOCKED'
        }
      );
      
      // Broadcast to all clients
      this.io.emit('round_locked', {
        roundId: data.roundId,
        lockPrice: data.lockPrice
      });
      
      logger.info(`Round ${data.roundId} locked and broadcasted`);
    } catch (error) {
      logger.error('Error handling round locked:', error);
    }
  }

  private async handleRoundResolved(data: any) {
    try {
      // Update database
      const round = await Round.findOneAndUpdate(
        { roundId: data.roundId },
        { 
          endPrice: data.endPrice,
          state: 'RESOLVED',
          resolved: true,
          winningPosition: data.winningPosition === 0 ? 'UP' : 'DOWN'
        },
        { new: true }
      );
      
      if (round) {
        // Update predictions with winning status
        const winningPosition = data.winningPosition === 0 ? 'UP' : 'DOWN';
        const predictions = await Prediction.findByRound(data.roundId);
        
        for (const prediction of predictions) {
          if (prediction.position === winningPosition) {
            const web3Service = getWeb3Service();
            const claimableAmount = await web3Service.getClaimableAmount(data.roundId, prediction.user);
            await prediction.markAsWinning(claimableAmount);
          } else {
            await prediction.markAsLosing();
          }
        }
      }
      
      // Broadcast to all clients
      this.io.emit('round_resolved', {
        roundId: data.roundId,
        endPrice: data.endPrice,
        winningPosition: data.winningPosition === 0 ? 'UP' : 'DOWN'
      });
      
      logger.info(`Round ${data.roundId} resolved and broadcasted`);
    } catch (error) {
      logger.error('Error handling round resolved:', error);
    }
  }

  private async handlePredictionMade(data: any) {
    try {
      // Broadcast to round participants
      this.io.to(`round:${data.roundId}`).emit('prediction_made', {
        roundId: data.roundId,
        position: data.position === 0 ? 'UP' : 'DOWN',
        amount: data.amount,
        user: data.user
      });
      
      // Send to specific user
      this.io.to(`user:${data.user.toLowerCase()}`).emit('prediction_confirmed', {
        roundId: data.roundId,
        position: data.position === 0 ? 'UP' : 'DOWN',
        amount: data.amount
      });
      
      logger.info(`Prediction made by ${data.user} for round ${data.roundId}`);
    } catch (error) {
      logger.error('Error handling prediction made:', error);
    }
  }

  private async handleRewardClaimed(data: any) {
    try {
      // Update database
      await Prediction.findOneAndUpdate(
        { user: data.user.toLowerCase(), roundId: data.roundId },
        { claimed: true, claimedAt: new Date() }
      );
      
      // Send to specific user
      this.io.to(`user:${data.user.toLowerCase()}`).emit('reward_claimed', {
        roundId: data.roundId,
        amount: data.amount
      });
      
      logger.info(`Reward claimed by ${data.user} for round ${data.roundId}`);
    } catch (error) {
      logger.error('Error handling reward claimed:', error);
    }
  }

  // Public methods for broadcasting updates
  public broadcastPriceUpdate(price: string, change24h: number) {
    this.io.emit('price_update', {
      price,
      change24h,
      timestamp: Date.now()
    });
  }

  public broadcastRoundUpdate(roundData: any) {
    this.io.emit('round_update', roundData);
  }

  public sendUserNotification(address: string, notification: any) {
    this.io.to(`user:${address.toLowerCase()}`).emit('notification', notification);
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getRoomSubscriptionsCount(): number {
    return this.roomSubscriptions.size;
  }
}

let webSocketService: WebSocketService;

export const setupWebSocket = (io: SocketIOServer): WebSocketService => {
  webSocketService = new WebSocketService(io);
  logger.info('WebSocket service initialized');
  return webSocketService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!webSocketService) {
    throw new Error('WebSocket service not initialized');
  }
  return webSocketService;
};

export { WebSocketService };
