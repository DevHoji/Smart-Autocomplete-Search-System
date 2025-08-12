/**
 * Custom hook for analytics data management
 * Handles fetching, caching, and real-time updates of analytics data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { AnalyticsData, UseAnalyticsReturn } from '../types/index';

interface UseAnalyticsOptions {
  days?: number;
  refreshInterval?: number;
  autoRefresh?: boolean;
  onError?: (error: string) => void;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    days = 7,
    refreshInterval = 30000, // 30 seconds
    autoRefresh = false,
    onError,
  } = options;

  const [data, setData] = useState<AnalyticsData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (showLoading = true) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (showLoading) {
      setIsLoading(true);
    }
    setError(undefined);

    try {
      const analyticsData = await apiService.getAnalytics(days);
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setData(analyticsData);
      setLastUpdated(new Date());
      setError(undefined);

    } catch (error: any) {
      // Don't update state if request was aborted
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = error.message || 'Failed to fetch analytics data';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [days, onError]);

  // Refetch data (public method)
  const refetch = useCallback(async () => {
    await fetchAnalytics(true);
  }, [fetchAnalytics]);

  // Silent refresh (for auto-refresh)
  const silentRefresh = useCallback(async () => {
    await fetchAnalytics(false);
  }, [fetchAnalytics]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        silentRefresh();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, silentRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Calculate derived metrics
  const derivedMetrics = data ? {
    // Growth rate (mock calculation - would need historical data)
    searchGrowthRate: data.search_analytics.total_searches > 0 ? 12.5 : 0,
    selectionGrowthRate: data.search_analytics.total_selections > 0 ? 8.3 : 0,
    
    // Top performing categories
    topCategories: data.top_words.reduce((acc, word) => {
      // This would need category data from the API
      const category = 'technology'; // Mock category
      acc[category] = (acc[category] || 0) + word.selections;
      return acc;
    }, {} as Record<string, number>),
    
    // Performance metrics
    avgWordsPerSearch: data.search_analytics.total_searches > 0 
      ? (data.trie_stats.word_count / data.search_analytics.total_searches).toFixed(2)
      : '0',
    
    // User engagement
    engagementScore: data.search_analytics.success_rate * 0.7 + 
                    (data.search_analytics.avg_response_time < 100 ? 30 : 0),
  } : null;

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    derivedMetrics,
    refetch,
  };
}
