
import { LRUCache } from 'lru-cache';
import type { TrieSuggestion } from '../types';

interface CacheEntry {
  result: any; 
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
  private readonly cacheExpiryMs = 5 * 60 * 1000; 
  private readonly optimizationIntervalMs = 30 * 60 * 1000; 

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

    this.startPeriodicOptimization();
  }


  async getCachedSuggestions<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    useContextCache: boolean = false
  ): Promise<T> {
    const startTime = Date.now();
    const cache = useContextCache ? this.contextCache : this.suggestionCache;
    
    const cached = cache.get(cacheKey);
    if (cached && this.isCacheEntryValid(cached)) {
      cached.hitCount++;
      this.metrics.cacheHits++;
      this.updateMetrics(startTime);
      return cached.result as T;
    }

    this.metrics.cacheMisses++;
    
    try {
      const result = await fetchFunction();
      
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

 
  generateSuggestionCacheKey(
    query: string,
    maxSuggestions: number,
    category?: string
  ): string {
    const normalizedQuery = query.toLowerCase().trim();
    return `suggest:${normalizedQuery}:${maxSuggestions}:${category || 'all'}`;
  }

 
  generateContextCacheKey(
    context: string,
    currentWord: string,
    maxSuggestions: number
  ): string {
    const contextWords = context.toLowerCase().trim().split(/\s+/);
    const relevantContext = contextWords.slice(-3).join(' '); // Last 3 words
    const normalizedWord = currentWord.toLowerCase().trim();
    
    return `context:${relevantContext}:${normalizedWord}:${maxSuggestions}`;
  }


  async preloadCommonSuggestions(
    commonQueries: string[],
    fetchFunction: (query: string) => Promise<TrieSuggestion[]>
  ): Promise<void> {
    const preloadPromises = commonQueries.map(async (query) => {
      const cacheKey = this.generateSuggestionCacheKey(query, 10);
      
      if (!this.suggestionCache.has(cacheKey)) {
        try {
          const suggestions = await fetchFunction(query);
          const cacheEntry: CacheEntry = {
            result: suggestions,
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

 
  optimizeCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.suggestionCache.entries()) {
      if (!this.isCacheEntryValid(entry) || 
          (entry.hitCount < 2 && now - entry.timestamp > this.cacheExpiryMs / 2)) {
        this.suggestionCache.delete(key);
      }
    }

    for (const [key, entry] of this.contextCache.entries()) {
      if (!this.isCacheEntryValid(entry)) {
        this.contextCache.delete(key);
      }
    }

    this.metrics.lastOptimization = now;
  }

  
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

  
  clearCache(): void {
    this.suggestionCache.clear();
    this.contextCache.clear();
    
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      lastOptimization: Date.now(),
    };
  }

 
  async warmUpCache(
    fetchFunction: (query: string) => Promise<TrieSuggestion[]>
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

  
  private isCacheEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp < this.cacheExpiryMs;
  }

 
  private updateMetrics(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.totalRequests++;
    
    if (this.metrics.averageResponseTime === 0) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * 0.9) + (responseTime * 0.1);
    }
  }

 
  private startPeriodicOptimization(): void {
    setInterval(() => {
      this.optimizeCache();
    }, this.optimizationIntervalMs);
  }

 
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

export const performanceOptimizer = new PerformanceOptimizer();
