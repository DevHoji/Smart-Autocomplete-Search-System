/**
 * Suggest endpoint - Core autocomplete functionality
 * GET /api/suggest?prefix=...&k=...&category=...
 * 
 * Returns top K suggestions for a given prefix using the server-side Trie
 */

import { Router, Request, Response } from 'express';
import { TrieService } from '@/services/TrieService';
import { asyncHandler, validateRequest } from '@/utils/middleware';
import { suggestQuerySchema } from '@/utils/validation';
import { SuggestRequest, SuggestResponse } from '@/types';

const router = Router();
const trieService = TrieService.getInstance();

/**
 * GET /api/suggest
 * Get autocomplete suggestions for a prefix
 * 
 * Query Parameters:
 * - prefix: string (required) - The prefix to search for
 * - k: number (optional, default: 10) - Maximum number of suggestions
 * - category: string (optional) - Filter by category
 * 
 * Response:
 * - suggestions: TrieSuggestion[] - Array of suggestions sorted by frequency
 * - prefix: string - The original prefix
 * - total: number - Total number of suggestions returned
 * - fuzzy: boolean - Whether fuzzy matching was used
 */
router.get('/', 
  validateRequest(suggestQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    // Extract and validate query parameters
    const { prefix, k = 10, category } = req.query as any;
    const userId = req.headers['x-user-id'] as string;

    try {
      // Get suggestions from TrieService
      const result = await trieService.getSuggestions(
        prefix,
        parseInt(k.toString()),
        category,
        userId
      );

      const responseTime = Date.now() - startTime;

      // Add performance headers
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Suggestion-Count': result.suggestions.length.toString(),
        'X-Cache-Status': 'MISS', // Could be enhanced with caching
      });

      // Return suggestions
      const response: SuggestResponse = {
        suggestions: result.suggestions,
        prefix: result.prefix,
        total: result.total,
        fuzzy: result.fuzzy,
      };

      res.json(response);

    } catch (error) {
      console.error('Error in suggest endpoint:', error);
      
      // Return empty suggestions on error to maintain UX
      const response: SuggestResponse = {
        suggestions: [],
        prefix: prefix || '',
        total: 0,
        fuzzy: false,
      };

      res.status(500).json({
        ...response,
        error: {
          message: 'Failed to get suggestions',
          code: 'SUGGEST_ERROR',
        },
      });
    }
  })
);

/**
 * GET /api/suggest/stats
 * Get statistics about the suggestion system
 */
router.get('/stats', 
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const stats = trieService.getTrieStats();
      
      res.json({
        trie_stats: stats,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });

    } catch (error) {
      console.error('Error getting suggest stats:', error);
      res.status(500).json({
        error: {
          message: 'Failed to get suggestion statistics',
          code: 'STATS_ERROR',
        },
      });
    }
  })
);

/**
 * GET /api/suggest/health
 * Health check for the suggestion system
 */
router.get('/health', 
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const stats = trieService.getTrieStats();
      
      const health = {
        status: 'healthy',
        trie_loaded: stats.wordCount > 0,
        word_count: stats.wordCount,
        avg_frequency: stats.avgFrequency,
        timestamp: new Date().toISOString(),
      };

      res.json(health);

    } catch (error) {
      console.error('Error in suggest health check:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: {
          message: 'Suggestion system is not available',
          code: 'HEALTH_CHECK_FAILED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  })
);

export default router;
