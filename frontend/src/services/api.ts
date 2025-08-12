/**
 * API service for communicating with the Smart Autocomplete backend
 * Handles all HTTP requests and response processing
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

import type {
  SuggestResponse,
  SelectRequest,
  SelectResponse,
  InsertRequest,
  InsertResponse,
  ApiError,
} from '../types';

import type { AnalyticsData } from '../types';

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
        const userId = this.getUserId();
        if (userId) {
          config.headers['x-user-id'] = userId;
        }
        config.headers['x-request-time'] = new Date().toISOString();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          const apiError: ApiError = {
            message: error.response.data?.error?.message || 'Server error',
            code: error.response.data?.error?.code || 'SERVER_ERROR',
            details: error.response.data?.error?.details,
          };
          return Promise.reject(apiError);
        } else if (error.request) {
          const apiError: ApiError = {
            message: 'Network error - please check your connection',
            code: 'NETWORK_ERROR',
          };
          return Promise.reject(apiError);
        } else {
          const apiError: ApiError = {
            message: error.message || 'Unknown error',
            code: 'UNKNOWN_ERROR',
          };
          return Promise.reject(apiError);
        }
      }
    );
  }

  private getUserId(): string {
    let userId = localStorage.getItem('autocomplete_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('autocomplete_user_id', userId);
    }
    return userId;
  }

  async getSuggestions(
    prefix: string,
    maxResults: number = 10,
    category?: string
  ): Promise<SuggestResponse> {
    const params = new URLSearchParams({
      prefix,
      k: maxResults.toString(),
    });
    if (category) params.append('category', category);

    const response = await this.client.get<SuggestResponse>(
      `/api/suggest?${params.toString()}`
    );
    return response.data;
  }

  async selectSuggestion(request: SelectRequest): Promise<SelectResponse> {
    const response = await this.client.post<SelectResponse>(
      '/api/select',
      request
    );
    return response.data;
  }

  async insertWord(request: InsertRequest): Promise<InsertResponse> {
    const response = await this.client.post<InsertResponse>(
      '/api/insert',
      request
    );
    return response.data;
  }

  async getAnalytics(days: number = 7): Promise<AnalyticsData> {
    const response = await this.client.get<AnalyticsData>(
      `/api/admin/stats?days=${days}`
    );
    return response.data;
  }

  async getHealth(): Promise<{
    status: string;
    trie_loaded: boolean;
    word_count: number;
    timestamp: string;
  }> {
    const response = await this.client.get('/api/suggest/health');
    return response.data;
  }

  async exportTrie(): Promise<unknown> {
    const response = await this.client.get('/api/export-trie');
    return response.data;
  }

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
    const response = await this.client.post('/api/select/batch', { selections });
    return response.data;
  }

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
    const response = await this.client.post('/api/insert/batch', { words });
    return response.data;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/api/admin/health');
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  getBaseUrl(): string {
    return API_BASE_URL;
  }

  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers, headers);
  }

  clearSession(): void {
    localStorage.removeItem('autocomplete_user_id');
  }
}

export const apiService = new ApiService();
export { ApiService };
