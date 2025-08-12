/**
 * API service for communicating with the Smart Autocomplete backend
 * Handles all HTTP requests and response processing
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  SuggestResponse,
  SelectRequest,
  SelectResponse,
  InsertRequest,
  InsertResponse,
  ApiError,
} from '../types/index';

// Import AnalyticsData separately to avoid module resolution issues
import type { AnalyticsData } from '../types/index';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 10000; // 10 seconds

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add user ID if available
        const userId = this.getUserId();
        if (userId) {
          config.headers['x-user-id'] = userId;
        }

        // Add timestamp for debugging
        config.headers['x-request-time'] = new Date().toISOString();

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
        // Handle common errors
        if (error.response) {
          // Server responded with error status
          const apiError: ApiError = {
            message: error.response.data?.error?.message || 'Server error',
            code: error.response.data?.error?.code || 'SERVER_ERROR',
            details: error.response.data?.error?.details,
          };
          return Promise.reject(apiError);
        } else if (error.request) {
          // Network error
          const apiError: ApiError = {
            message: 'Network error - please check your connection',
            code: 'NETWORK_ERROR',
          };
          return Promise.reject(apiError);
        } else {
          // Other error
          const apiError: ApiError = {
            message: error.message || 'Unknown error',
            code: 'UNKNOWN_ERROR',
          };
          return Promise.reject(apiError);
        }
      }
    );
  }

  /**
   * Get user ID from localStorage or generate a new one
   */
  private getUserId(): string {
    let userId = localStorage.getItem('autocomplete_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('autocomplete_user_id', userId);
    }
    return userId;
  }

  /**
   * Get autocomplete suggestions for a prefix
   */
  async getSuggestions(
    prefix: string,
    maxResults: number = 10,
    category?: string
  ): Promise<SuggestResponse> {
    const params = new URLSearchParams({
      prefix,
      k: maxResults.toString(),
    });

    if (category) {
      params.append('category', category);
    }

    const response = await this.client.get<SuggestResponse>(
      `/api/suggest?${params.toString()}`
    );

    return response.data;
  }

  /**
   * Record a suggestion selection
   */
  async selectSuggestion(request: SelectRequest): Promise<SelectResponse> {
    const response = await this.client.post<SelectResponse>(
      '/api/select',
      request
    );

    return response.data;
  }

  /**
   * Insert a new word into the vocabulary
   */
  async insertWord(request: InsertRequest): Promise<InsertResponse> {
    const response = await this.client.post<InsertResponse>(
      '/api/insert',
      request
    );

    return response.data;
  }

  /**
   * Get analytics data
   */
  async getAnalytics(days: number = 7): Promise<AnalyticsData> {
    const response = await this.client.get<AnalyticsData>(
      `/api/admin/stats?days=${days}`
    );

    return response.data;
  }

  /**
   * Get system health status
   */
  async getHealth(): Promise<{
    status: string;
    trie_loaded: boolean;
    word_count: number;
    timestamp: string;
  }> {
    const response = await this.client.get('/api/suggest/health');
    return response.data;
  }

  /**
   * Export Trie data
   */
  async exportTrie(): Promise<any> {
    const response = await this.client.get('/api/export-trie');
    return response.data;
  }

  /**
   * Get Trie statistics
   */
  async getTrieStats(): Promise<{
    trie_stats: {
      wordCount: number;
      totalFrequency: number;
      avgFrequency: number;
      maxDepth: number;
      nodeCount: number;
    };
    timestamp: string;
    version: string;
  }> {
    const response = await this.client.get('/api/suggest/stats');
    return response.data;
  }

  /**
   * Batch select multiple suggestions
   */
  async batchSelect(selections: SelectRequest[]): Promise<{
    success: boolean;
    results: Array<{
      word: string;
      success: boolean;
      newFreq?: number;
      error?: string;
    }>;
    total: number;
    successful: number;
    failed: number;
  }> {
    const response = await this.client.post('/api/select/batch', {
      selections,
    });

    return response.data;
  }

  /**
   * Batch insert multiple words
   */
  async batchInsert(words: InsertRequest[]): Promise<{
    success: boolean;
    results: Array<{
      word: string;
      success: boolean;
      error?: string;
    }>;
    total: number;
    successful: number;
    failed: number;
  }> {
    const response = await this.client.post('/api/insert/batch', {
      words,
    });

    return response.data;
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/api/admin/health');
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get API base URL
   */
  getBaseUrl(): string {
    return API_BASE_URL;
  }

  /**
   * Set custom headers for requests
   */
  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers, headers);
  }

  /**
   * Clear user session
   */
  clearSession(): void {
    localStorage.removeItem('autocomplete_user_id');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing
export { ApiService };
