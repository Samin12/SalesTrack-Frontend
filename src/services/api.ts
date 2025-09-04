/**
 * API client for YouTube Analytics backend
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ChannelOverview,
  ChannelGrowthResponse,
  VideosListResponse,
  VideoPerformanceResponse,
  TrafficResponse,
  AnalyticsOverviewResponse,
  AuthURLResponse,
  TokenResponse,
  BaseResponse,
  DateRangeParams,
  VideoQueryParams,
  ErrorResponse,
} from '@/types';

class APIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to auth
          this.clearAuthToken();
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Health endpoints
  async getHealth(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  async getRoot(): Promise<any> {
    const response = await this.client.get('/');
    return response.data;
  }

  // Authentication endpoints
  async getGoogleAuthURL(): Promise<AuthURLResponse> {
    const response = await this.client.get('/api/v1/auth/google');
    return response.data;
  }

  async handleOAuthCallback(code: string): Promise<TokenResponse> {
    const response = await this.client.get(`/api/v1/auth/google/callback?code=${code}`);
    const data = response.data;
    
    // Store the token
    if (data.access_token) {
      this.setAuthToken(data.access_token);
    }
    
    return data;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await this.client.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    const data = response.data;
    
    if (data.access_token) {
      this.setAuthToken(data.access_token);
    }
    
    return data;
  }

  async logout(): Promise<BaseResponse> {
    const response = await this.client.post('/api/v1/auth/logout');
    this.clearAuthToken();
    return response.data;
  }

  async getAuthStatus(): Promise<BaseResponse> {
    const response = await this.client.get('/api/v1/auth/status');
    return response.data;
  }

  // Analytics endpoints
  async getChannelOverview(): Promise<ChannelOverview> {
    const response = await this.client.get('/api/v1/analytics/channel/overview');
    return response.data;
  }

  async getChannelGrowth(params?: DateRangeParams): Promise<ChannelGrowthResponse> {
    const response = await this.client.get('/api/v1/analytics/channel/growth', {
      params,
    });
    return response.data;
  }

  async getVideos(params?: VideoQueryParams): Promise<VideosListResponse> {
    const response = await this.client.get('/api/v1/analytics/videos', {
      params,
    });
    return response.data;
  }

  async getVideoPerformance(
    videoId: string,
    params?: DateRangeParams
  ): Promise<VideoPerformanceResponse> {
    const response = await this.client.get(`/api/v1/analytics/videos/${videoId}`, {
      params,
    });
    return response.data;
  }

  async getWebsiteTraffic(params?: DateRangeParams): Promise<TrafficResponse> {
    const response = await this.client.get('/api/v1/analytics/traffic/website', {
      params,
    });
    return response.data;
  }

  async getAnalyticsOverview(): Promise<AnalyticsOverviewResponse> {
    const response = await this.client.get('/api/v1/analytics/overview');
    return response.data;
  }

  async getDashboardData(): Promise<any> {
    const response = await this.client.get('/api/v1/analytics/dashboard-data');
    return response.data;
  }

  async syncAnalyticsData(): Promise<BaseResponse> {
    const response = await this.client.post('/api/v1/analytics/sync');
    return response.data;
  }

  // Weekly Performance Endpoints
  async getWeeklyVideoPerformance(): Promise<any> {
    const response = await this.client.get('/api/v1/analytics/videos/weekly-performance');
    return response.data;
  }

  async getVideoWeeklyHistory(videoId: string, weeks: number = 8): Promise<any> {
    const response = await this.client.get(`/api/v1/analytics/videos/${videoId}/weekly-history`, {
      params: { weeks }
    });
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }



  // Error handling helper
  handleError(error: any): ErrorResponse {
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      status: 'error',
      message: error.message || 'An unexpected error occurred',
      error_code: 'CLIENT_ERROR',
      timestamp: new Date().toISOString(),
    };
  }
}

// Create singleton instance
const apiClient = new APIClient();

export default apiClient;

// Export individual methods for easier importing
export const {
  getHealth,
  getRoot,
  getGoogleAuthURL,
  handleOAuthCallback,
  refreshToken,
  logout,
  getAuthStatus,
  getChannelOverview,
  getChannelGrowth,
  getVideos,
  getVideoPerformance,
  getWebsiteTraffic,
  getAnalyticsOverview,
  getDashboardData,
  syncAnalyticsData,
  getWeeklyVideoPerformance,
  getVideoWeeklyHistory,
  isAuthenticated,
  handleError,
} = apiClient;

// SWR fetcher function
export const fetcher = (url: string) => apiClient.client.get(url).then(res => res.data);
