import cron from 'node-cron';
import { logger } from '@/utils/logger';
import { getPriceService } from './priceService';
import { getWeb3Service } from '@/config/web3';
import Round from '@/models/Round';
import Prediction from '@/models/Prediction';
import User from '@/models/User';
import { getWebSocketService } from './websocket';

class CronJobService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isInitialized = false;

  constructor() {
    logger.info('Cron job service initialized');
  }

  /**
   * Start all cron jobs
   */
  public startAll(): void {
    if (this.isInitialized) {
      logger.warn('Cron jobs already initialized');
      return;
    }

    try {
      this.startPriceUpdateJob();
      this.startRoundManagementJob();
      this.startAnalyticsJob();
      this.startCleanupJob();
      
      this.isInitialized = true;
      logger.info('All cron jobs started successfully');
    } catch (error) {
      logger.error('Error starting cron jobs:', error);
    }
  }

  /**
   * Stop all cron jobs
   */
  public stopAll(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
    this.isInitialized = false;
    logger.info('All cron jobs stopped');
  }

  /**
   * Price update job - runs every minute
   */
  private startPriceUpdateJob(): void {
    const job = cron.schedule(
      process.env.PRICE_UPDATE_INTERVAL || '*/1 * * * *',
      async () => {
        try {
          const priceService = getPriceService();
          await priceService.updateAndBroadcastPrice();
        } catch (error) {
          logger.error('Price update job failed:', error);
        }
      },
      {
        scheduled: false,
        name: 'priceUpdate'
      }
    );

    job.start();
    this.jobs.set('priceUpdate', job);
    logger.info('Price update job started (every minute)');
  }

  /**
   * Round management job - runs every 5 minutes
   */
  private startRoundManagementJob(): void {
    const job = cron.schedule(
      process.env.ROUND_CHECK_INTERVAL || '*/5 * * * *',
      async () => {
        try {
          await this.checkAndManageRounds();
        } catch (error) {
          logger.error('Round management job failed:', error);
        }
      },
      {
        scheduled: false,
        name: 'roundManagement'
      }
    );

    job.start();
    this.jobs.set('roundManagement', job);
    logger.info('Round management job started (every 5 minutes)');
  }

  /**
   * Analytics job - runs every hour
   */
  private startAnalyticsJob(): void {
    const job = cron.schedule(
      '0 * * * *', // Every hour
      async () => {
        try {
          await this.updateAnalytics();
        } catch (error) {
          logger.error('Analytics job failed:', error);
        }
      },
      {
        scheduled: false,
        name: 'analytics'
      }
    );

    job.start();
    this.jobs.set('analytics', job);
    logger.info('Analytics job started (every hour)');
  }

  /**
   * Cleanup job - runs daily at 2 AM
   */
  private startCleanupJob(): void {
    const job = cron.schedule(
      '0 2 * * *', // Daily at 2 AM
      async () => {
        try {
          await this.performCleanup();
        } catch (error) {
          logger.error('Cleanup job failed:', error);
        }
      },
      {
        scheduled: false,
        name: 'cleanup'
      }
    );

    job.start();
    this.jobs.set('cleanup', job);
    logger.info('Cleanup job started (daily at 2 AM)');
  }

  /**
   * Check and manage rounds (lock/resolve)
   */
  private async checkAndManageRounds(): Promise<void> {
    try {
      const web3Service = getWeb3Service();
      const priceService = getPriceService();
      const now = new Date();

      // Check for rounds that need to be locked
      const roundsToLock = await Round.find({
        state: 'ACTIVE',
        lockTime: { $lte: now }
      });

      for (const round of roundsToLock) {
        try {
          const currentPrice = await priceService.getCurrentPrice();
          if (currentPrice) {
            // Lock the round on blockchain
            const tx = await web3Service.lockRound(currentPrice.price.toString());
            await tx.wait();

            // Update database
            round.lockPrice = currentPrice.price.toString();
            round.state = 'LOCKED';
            round.transactions.lock = tx.hash;
            await round.save();

            logger.info(`Round ${round.roundId} locked at price ${currentPrice.price}`);
          }
        } catch (error) {
          logger.error(`Failed to lock round ${round.roundId}:`, error);
        }
      }

      // Check for rounds that need to be resolved
      const roundsToResolve = await Round.find({
        state: 'LOCKED',
        endTime: { $lte: now },
        resolved: false
      });

      for (const round of roundsToResolve) {
        try {
          const endPrice = await priceService.getPriceAtTime(round.endTime.getTime());
          if (endPrice) {
            // Resolve the round on blockchain
            const tx = await web3Service.resolveRound(endPrice.toString());
            await tx.wait();

            // Update database
            round.endPrice = endPrice.toString();
            round.state = 'RESOLVED';
            round.resolved = true;
            round.winningPosition = endPrice > parseFloat(round.lockPrice!) ? 'UP' : 'DOWN';
            round.transactions.resolve = tx.hash;
            await round.save();

            // Update predictions
            await this.updatePredictionsForResolvedRound(round);

            logger.info(`Round ${round.roundId} resolved at price ${endPrice}`);
          }
        } catch (error) {
          logger.error(`Failed to resolve round ${round.roundId}:`, error);
        }
      }

      // Start new round if needed
      const activeRound = await Round.findOne({ state: 'ACTIVE' });
      if (!activeRound) {
        await this.startNewRound();
      }

    } catch (error) {
      logger.error('Error in round management:', error);
    }
  }

  /**
   * Start a new prediction round
   */
  private async startNewRound(): Promise<void> {
    try {
      const web3Service = getWeb3Service();
      const priceService = getPriceService();

      const currentPrice = await priceService.getCurrentPrice();
      if (currentPrice) {
        // Start new round on blockchain
        const tx = await web3Service.startRound(currentPrice.price.toString());
        await tx.wait();

        // Get the round ID from blockchain
        const currentRoundId = await web3Service.getCurrentRoundId();

        // Create database record
        const now = new Date();
        const lockTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        const endTime = new Date(lockTime.getTime() + 24 * 60 * 60 * 1000); // +24 hours

        const round = new Round({
          roundId: currentRoundId,
          startTime: now,
          lockTime,
          endTime,
          startPrice: currentPrice.price.toString(),
          state: 'ACTIVE',
          transactions: { start: tx.hash }
        });

        await round.save();

        logger.info(`New round ${currentRoundId} started at price ${currentPrice.price}`);
      }
    } catch (error) {
      logger.error('Error starting new round:', error);
    }
  }

  /**
   * Update predictions after round resolution
   */
  private async updatePredictionsForResolvedRound(round: any): Promise<void> {
    try {
      const web3Service = getWeb3Service();
      const predictions = await Prediction.findByRound(round.roundId);

      for (const prediction of predictions) {
        try {
          const isWinning = prediction.position === round.winningPosition;
          
          if (isWinning) {
            const claimableAmount = await web3Service.getClaimableAmount(round.roundId, prediction.user);
            await prediction.markAsWinning(claimableAmount);
          } else {
            await prediction.markAsLosing();
          }
        } catch (error) {
          logger.error(`Error updating prediction for user ${prediction.user}:`, error);
        }
      }

      logger.info(`Updated ${predictions.length} predictions for round ${round.roundId}`);
    } catch (error) {
      logger.error('Error updating predictions:', error);
    }
  }

  /**
   * Update analytics and user statistics
   */
  private async updateAnalytics(): Promise<void> {
    try {
      logger.info('Starting analytics update...');

      // Update user statistics from blockchain
      const users = await User.find({ isActive: true }).limit(100); // Process in batches

      for (const user of users) {
        try {
          const web3Service = getWeb3Service();
          const blockchainStats = await web3Service.getUserStats(user.address);
          
          await user.updateStats(blockchainStats);
        } catch (error) {
          logger.error(`Error updating stats for user ${user.address}:`, error);
        }
      }

      // Calculate platform statistics
      const platformStats = await this.calculatePlatformStats();
      
      // Cache platform stats
      const { cacheService } = await import('@/config/redis');
      await cacheService.set('platform_stats', JSON.stringify(platformStats), 3600); // 1 hour TTL

      logger.info('Analytics update completed');
    } catch (error) {
      logger.error('Error updating analytics:', error);
    }
  }

  /**
   * Calculate platform-wide statistics
   */
  private async calculatePlatformStats(): Promise<any> {
    try {
      const [
        totalUsers,
        totalRounds,
        totalPredictions,
        totalVolume
      ] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Round.countDocuments(),
        Prediction.countDocuments(),
        Prediction.aggregate([
          { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ])
      ]);

      const recentRounds = await Round.find({ resolved: true })
        .sort({ roundId: -1 })
        .limit(10);

      const avgParticipants = recentRounds.length > 0 
        ? recentRounds.reduce((sum, round) => sum + round.participantCount, 0) / recentRounds.length
        : 0;

      return {
        totalUsers,
        totalRounds,
        totalPredictions,
        totalVolume: totalVolume[0]?.total || 0,
        avgParticipants: Math.round(avgParticipants),
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error calculating platform stats:', error);
      return null;
    }
  }

  /**
   * Perform cleanup tasks
   */
  private async performCleanup(): Promise<void> {
    try {
      logger.info('Starting cleanup tasks...');

      // Clean up old price history (keep only 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      await Round.updateMany(
        { createdAt: { $lt: sevenDaysAgo } },
        { $set: { priceHistory: [] } }
      );

      // Clean up expired user sessions (if any)
      // This would depend on your session management implementation

      // Log cleanup completion
      logger.info('Cleanup tasks completed');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  /**
   * Get job status
   */
  public getJobStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    this.jobs.forEach((job, name) => {
      status[name] = job.running;
    });

    return status;
  }

  /**
   * Restart a specific job
   */
  public restartJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      job.start();
      logger.info(`Restarted cron job: ${jobName}`);
      return true;
    }
    return false;
  }
}

// Singleton instance
let cronJobService: CronJobService;

export const startCronJobs = (): CronJobService => {
  if (!cronJobService) {
    cronJobService = new CronJobService();
  }
  cronJobService.startAll();
  return cronJobService;
};

export const getCronJobService = (): CronJobService => {
  if (!cronJobService) {
    cronJobService = new CronJobService();
  }
  return cronJobService;
};

export { CronJobService };
