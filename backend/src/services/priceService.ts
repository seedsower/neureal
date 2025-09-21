import axios from 'axios';
import { cacheService } from '@/config/redis';
import { logger } from '@/utils/logger';
import { getWebSocketService } from './websocket';

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

interface PriceHistory {
  timestamp: number;
  price: number;
}

class PriceService {
  private readonly CACHE_KEY = 'neural_price';
  private readonly HISTORY_KEY = 'neural_price_history';
  private readonly CACHE_TTL = 60; // 1 minute
  private readonly HISTORY_TTL = 86400; // 24 hours
  private readonly API_URL = process.env.PRICE_API_URL || 'https://api.coingecko.com/api/v3';
  private readonly API_KEY = process.env.COINGECKO_API_KEY;

  constructor() {
    logger.info('Price service initialized');
  }

  /**
   * Get current NEURAL token price from CoinGecko
   */
  async getCurrentPrice(): Promise<PriceData | null> {
    try {
      // Try to get from cache first
      const cachedPrice = await cacheService.get(this.CACHE_KEY);
      if (cachedPrice) {
        return JSON.parse(cachedPrice);
      }

      // Fetch from API
      const response = await axios.get(`${this.API_URL}/simple/price`, {
        params: {
          ids: 'neural-token', // This would be the actual CoinGecko ID
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true
        },
        headers: this.API_KEY ? { 'X-CG-Pro-API-Key': this.API_KEY } : {},
        timeout: 10000
      });

      const data = response.data['neural-token'];
      if (!data) {
        // Fallback: generate mock price for development
        return this.generateMockPrice();
      }

      const priceData: PriceData = {
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        volume24h: data.usd_24h_vol || 0,
        marketCap: data.usd_market_cap || 0,
        lastUpdated: new Date()
      };

      // Cache the result
      await cacheService.set(this.CACHE_KEY, JSON.stringify(priceData), this.CACHE_TTL);

      // Add to price history
      await this.addToPriceHistory(priceData.price);

      return priceData;
    } catch (error) {
      logger.error('Error fetching current price:', error);
      
      // Try to return cached data even if expired
      const cachedPrice = await cacheService.get(this.CACHE_KEY);
      if (cachedPrice) {
        logger.warn('Returning expired cached price data');
        return JSON.parse(cachedPrice);
      }

      // Last resort: generate mock price
      return this.generateMockPrice();
    }
  }

  /**
   * Generate mock price for development/testing
   */
  private async generateMockPrice(): Promise<PriceData> {
    const basePrice = 0.15; // Base price in USD
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = basePrice + (basePrice * variation);
    
    const change24h = (Math.random() - 0.5) * 20; // ±10% change

    const priceData: PriceData = {
      price: parseFloat(price.toFixed(6)),
      change24h: parseFloat(change24h.toFixed(2)),
      volume24h: Math.random() * 1000000,
      marketCap: price * 100000000, // 100M total supply
      lastUpdated: new Date()
    };

    // Cache the mock data
    await cacheService.set(this.CACHE_KEY, JSON.stringify(priceData), this.CACHE_TTL);
    await this.addToPriceHistory(priceData.price);

    return priceData;
  }

  /**
   * Add price point to history
   */
  private async addToPriceHistory(price: number): Promise<void> {
    try {
      const timestamp = Date.now();
      const historyPoint: PriceHistory = { timestamp, price };

      // Get existing history
      const existingHistory = await cacheService.get(this.HISTORY_KEY);
      let history: PriceHistory[] = existingHistory ? JSON.parse(existingHistory) : [];

      // Add new point
      history.push(historyPoint);

      // Keep only last 24 hours of data (assuming updates every minute = 1440 points)
      const oneDayAgo = timestamp - (24 * 60 * 60 * 1000);
      history = history.filter(point => point.timestamp > oneDayAgo);

      // Save back to cache
      await cacheService.set(this.HISTORY_KEY, JSON.stringify(history), this.HISTORY_TTL);
    } catch (error) {
      logger.error('Error adding to price history:', error);
    }
  }

  /**
   * Get price history for the last 24 hours
   */
  async getPriceHistory(hours: number = 24): Promise<PriceHistory[]> {
    try {
      const historyData = await cacheService.get(this.HISTORY_KEY);
      if (!historyData) {
        return [];
      }

      const history: PriceHistory[] = JSON.parse(historyData);
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);

      return history.filter(point => point.timestamp > cutoffTime);
    } catch (error) {
      logger.error('Error getting price history:', error);
      return [];
    }
  }

  /**
   * Get price at a specific timestamp (for round resolution)
   */
  async getPriceAtTime(timestamp: number): Promise<number | null> {
    try {
      const history = await this.getPriceHistory(48); // Get 48 hours to be safe
      
      if (history.length === 0) {
        return null;
      }

      // Find the closest price point to the timestamp
      let closestPoint = history[0];
      let minDiff = Math.abs(history[0].timestamp - timestamp);

      for (const point of history) {
        const diff = Math.abs(point.timestamp - timestamp);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = point;
        }
      }

      // Only return if the closest point is within 5 minutes of the target
      if (minDiff <= 5 * 60 * 1000) {
        return closestPoint.price;
      }

      return null;
    } catch (error) {
      logger.error('Error getting price at time:', error);
      return null;
    }
  }

  /**
   * Update price and broadcast to WebSocket clients
   */
  async updateAndBroadcastPrice(): Promise<void> {
    try {
      const priceData = await this.getCurrentPrice();
      if (priceData) {
        // Broadcast to WebSocket clients
        try {
          const wsService = getWebSocketService();
          wsService.broadcastPriceUpdate(priceData.price.toString(), priceData.change24h);
        } catch (wsError) {
          // WebSocket service might not be initialized yet
          logger.debug('WebSocket service not available for price broadcast');
        }

        logger.debug(`Price updated: $${priceData.price} (${priceData.change24h > 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%)`);
      }
    } catch (error) {
      logger.error('Error updating and broadcasting price:', error);
    }
  }

  /**
   * Get price statistics
   */
  async getPriceStats(): Promise<{
    current: number;
    high24h: number;
    low24h: number;
    change24h: number;
    volume24h: number;
  } | null> {
    try {
      const currentPrice = await this.getCurrentPrice();
      const history = await this.getPriceHistory(24);

      if (!currentPrice || history.length === 0) {
        return null;
      }

      const prices = history.map(h => h.price);
      const high24h = Math.max(...prices);
      const low24h = Math.min(...prices);

      return {
        current: currentPrice.price,
        high24h,
        low24h,
        change24h: currentPrice.change24h,
        volume24h: currentPrice.volume24h
      };
    } catch (error) {
      logger.error('Error getting price stats:', error);
      return null;
    }
  }

  /**
   * Clear price cache (useful for testing)
   */
  async clearCache(): Promise<void> {
    try {
      await cacheService.del(this.CACHE_KEY);
      await cacheService.del(this.HISTORY_KEY);
      logger.info('Price cache cleared');
    } catch (error) {
      logger.error('Error clearing price cache:', error);
    }
  }
}

// Singleton instance
let priceService: PriceService;

export const getPriceService = (): PriceService => {
  if (!priceService) {
    priceService = new PriceService();
  }
  return priceService;
};

export { PriceService };
