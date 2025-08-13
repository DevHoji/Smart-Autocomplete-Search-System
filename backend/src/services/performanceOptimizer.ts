/**
 * Performance Optimizer Service
 * Optimizes Trie operations and caching for real-time sentence-level autocomplete
 */

import { LRUCache } from 'lru-cache';
import type { Suggestion } from '../types';

interface CacheEntry {
  result: any; // Store the full result object
  timestamp: number;
  hitCount: number;
}

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  totalRequests: number;
  lastOptimization: number;
}

export class PerformanceOptimizer {
  private suggestionCache: LRUCache<string, CacheEntry>;
  private contextCache: LRUCache<string, CacheEntry>;
  private metrics: PerformanceMetrics;
  private readonly maxCacheSize = 10000;
  private readonly cacheExpiryMs = 5 * 60 * 1000; // 5 minutes
  private readonly optimizationIntervalMs = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.suggestionCache = new LRUCache<string, CacheEntry>({
      max: this.maxCacheSize,
      ttl: this.cacheExpiryMs,
    });

    this.contextCache = new LRUCache<string, CacheEntry>({
      max: this.maxCacheSize / 2,
      ttl: this.cacheExpiryMs,
    });

    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      lastOptimization: Date.now(),
    };

    // Start periodic optimization
    this.startPeriodicOptimization();
  }

  /**
   * Get cached suggestions or execute function and cache result
   */
  async getCachedSuggestions<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    useContextCache: boolean = false
  ): Promise<T> {
    const startTime = Date.now();
    const cache = useContextCache ? this.contextCache : this.suggestionCache;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && this.isCacheEntryValid(cached)) {
      cached.hitCount++;
      this.metrics.cacheHits++;
      this.updateMetrics(startTime);
      return cached.result as T;
    }

    // Cache miss - fetch new data
    this.metrics.cacheMisses++;
    
    try {
      const result = await fetchFunction();
      
      // Cache the result
      const cacheEntry: CacheEntry = {
        result: result,
        timestamp: Date.now(),
        hitCount: 1,
      };
      
      cache.set(cacheKey, cacheEntry);
      this.updateMetrics(startTime);
      
      return result;
    } catch (error) {
      this.updateMetrics(startTime);
      throw error;
    }
  }

  /**
   * Generate optimized cache key for suggestions
   */
  generateSuggestionCacheKey(
    query: string,
    maxSuggestions: number,
    category?: string
  ): string {
    const normalizedQuery = query.toLowerCase().trim();
    return `suggest:${normalizedQuery}:${maxSuggestions}:${category || 'all'}`;
  }

  /**
   * Generate optimized cache key for contextual suggestions
   */
  generateContextCacheKey(
    context: string,
    currentWord: string,
    maxSuggestions: number
  ): string {
    // Use only the last few words of context for better cache hits
    const contextWords = context.toLowerCase().trim().split(/\s+/);
    const relevantContext = contextWords.slice(-3).join(' '); // Last 3 words
    const normalizedWord = currentWord.toLowerCase().trim();
    
    return `context:${relevantContext}:${normalizedWord}:${maxSuggestions}`;
  }

  /**
   * Preload common suggestions into cache
   */
  async preloadCommonSuggestions(
    commonQueries: string[],
    fetchFunction: (query: string) => Promise<Suggestion[]>
  ): Promise<void> {
    const preloadPromises = commonQueries.map(async (query) => {
      const cacheKey = this.generateSuggestionCacheKey(query, 10);
      
      if (!this.suggestionCache.has(cacheKey)) {
        try {
          const suggestions = await fetchFunction(query);
          const cacheEntry: CacheEntry = {
            suggestions,
            timestamp: Date.now(),
            hitCount: 0,
          };
          this.suggestionCache.set(cacheKey, cacheEntry);
        } catch (error) {
          console.warn(`Failed to preload suggestions for "${query}":`, error);
        }
      }
    });

    await Promise.all(preloadPromises);
  }

  /**
   * Optimize cache by removing least used entries
   */
  optimizeCache(): void {
    const now = Date.now();
    
    // Clean expired entries and low-hit entries from suggestion cache
    for (const [key, entry] of this.suggestionCache.entries()) {
      if (!this.isCacheEntryValid(entry) || 
          (entry.hitCount < 2 && now - entry.timestamp > this.cacheExpiryMs / 2)) {
        this.suggestionCache.delete(key);
      }
    }

    // Clean expired entries from context cache
    for (const [key, entry] of this.contextCache.entries()) {
      if (!this.isCacheEntryValid(entry)) {
        this.contextCache.delete(key);
      }
    }

    this.metrics.lastOptimization = now;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics & {
    cacheHitRate: number;
    suggestionCacheSize: number;
    contextCacheSize: number;
  } {
    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0 
      ? this.metrics.cacheHits / totalCacheRequests 
      : 0;

    return {
      ...this.metrics,
      cacheHitRate,
      suggestionCacheSize: this.suggestionCache.size,
      contextCacheSize: this.contextCache.size,
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.suggestionCache.clear();
    this.contextCache.clear();
    
    // Reset metrics
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      lastOptimization: Date.now(),
    };
  }

  /**
   * Warm up cache with common single-letter queries
   */
  async warmUpCache(
    fetchFunction: (query: string) => Promise<Suggestion[]>
  ): Promise<void> {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const commonWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
      'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'
    ];

    const queriesToWarmUp = [...alphabet, ...commonWords];
    
    console.log('Warming up cache with common queries...');
    await this.preloadCommonSuggestions(queriesToWarmUp, fetchFunction);
    console.log(`Cache warmed up with ${queriesToWarmUp.length} common queries`);
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp < this.cacheExpiryMs;
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.totalRequests++;
    
    // Update average response time using exponential moving average
    if (this.metrics.averageResponseTime === 0) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * 0.9) + (responseTime * 0.1);
    }
  }

  /**
   * Start periodic cache optimization
   */
  private startPeriodicOptimization(): void {
    setInterval(() => {
      this.optimizeCache();
    }, this.optimizationIntervalMs);
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    suggestionCache: { size: number; maxSize: number };
    contextCache: { size: number; maxSize: number };
    metrics: PerformanceMetrics;
  } {
    return {
      suggestionCache: {
        size: this.suggestionCache.size,
        maxSize: this.maxCacheSize,
      },
      contextCache: {
        size: this.contextCache.size,
        maxSize: this.maxCacheSize / 2,
      },
      metrics: this.metrics,
    };
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();
