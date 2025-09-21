import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/constants';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Clear token on unauthorized
          this.setToken(null);
          // Optionally redirect to login or show auth modal
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }

  // Auth endpoints
  async getNonce(address: string) {
    return this.post('/auth/nonce', { address });
  }

  async verifySignature(address: string, signature: string, nonce: string) {
    return this.post('/auth/verify', { address, signature, nonce });
  }

  async refreshToken() {
    return this.post('/auth/refresh');
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // User endpoints
  async getUserProfile() {
    return this.get('/users/profile');
  }

  async updateUserProfile(data: any) {
    return this.put('/users/profile', data);
  }

  async updateUserPreferences(data: any) {
    return this.put('/users/preferences', data);
  }

  async getUserStats() {
    return this.get('/users/stats');
  }

  async getUserHistory(params?: any) {
    return this.get('/users/history', { params });
  }

  async getUserPortfolio() {
    return this.get('/users/portfolio');
  }

  // Round endpoints
  async getCurrentRound() {
    return this.get('/rounds/current');
  }

  async getRound(roundId: number) {
    return this.get(`/rounds/${roundId}`);
  }

  async getRounds(params?: any) {
    return this.get('/rounds', { params });
  }

  async getRoundPredictions(roundId: number, params?: any) {
    return this.get(`/rounds/${roundId}/predictions`, { params });
  }

  async getPriceHistory(params?: any) {
    return this.get('/rounds/price-history', { params });
  }

  // Prediction endpoints
  async makePrediction(data: any) {
    return this.post('/predictions', data);
  }

  async getUserPredictions(params?: any) {
    return this.get('/predictions', { params });
  }

  async getUserPredictionForRound(roundId: number) {
    return this.get(`/predictions/${roundId}`);
  }

  async claimReward(roundId: number) {
    return this.post(`/predictions/${roundId}/claim`);
  }

  async getUnclaimedPredictions() {
    return this.get('/predictions/unclaimed');
  }

  async getPredictionStats() {
    return this.get('/predictions/stats');
  }

  // Leaderboard endpoints
  async getTopWinners(params?: any) {
    return this.get('/leaderboard/top-winners', { params });
  }

  async getWinRateLeaderboard(params?: any) {
    return this.get('/leaderboard/win-rate', { params });
  }

  async getWinStreakLeaderboard(params?: any) {
    return this.get('/leaderboard/win-streak', { params });
  }

  async getVolumeLeaderboard(params?: any) {
    return this.get('/leaderboard/volume', { params });
  }

  async getRoiLeaderboard(params?: any) {
    return this.get('/leaderboard/roi', { params });
  }

  async getUserRankings(address: string) {
    return this.get(`/leaderboard/user/${address}`);
  }

  // Stats endpoints
  async getPlatformStats() {
    return this.get('/stats/platform');
  }

  async getRoundStats(params?: any) {
    return this.get('/stats/rounds', { params });
  }

  async getPredictionStats(params?: any) {
    return this.get('/stats/predictions', { params });
  }

  async getPriceStats(params?: any) {
    return this.get('/stats/price', { params });
  }

  async getBlockchainStats() {
    return this.get('/stats/blockchain');
  }
}

export const apiService = new ApiService();
export default apiService;
