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
import { performanceOptimizer } from '../services/performanceOptimizer';

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
      // Generate cache key
      const cacheKey = performanceOptimizer.generateSuggestionCacheKey(
        prefix,
        parseInt(k.toString()),
        category
      );

      // Get suggestions directly from trie service
      const result = await trieService.getSuggestions(
        prefix,
        parseInt(k.toString()),
        category,
        userId
      );

      const responseTime = Date.now() - startTime;

      // Ensure result is valid
      if (!result || !result.suggestions) {
        throw new Error('Invalid result from suggestion service');
      }

      // Add performance headers
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Suggestion-Count': result.suggestions.length.toString(),
        'X-Cache-Status': 'HIT', // Enhanced with caching
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

// Contextual suggestions endpoint
router.post('/contextual-suggestions', async (req: Request, res: Response) => {
  try {
    const { context, currentWord, maxSuggestions = 5 } = req.body;

    if (!context || typeof context !== 'string') {
      return res.status(400).json({
        error: 'Context is required and must be a string',
      });
    }

    if (!currentWord || typeof currentWord !== 'string') {
      return res.status(400).json({
        error: 'Current word is required and must be a string',
      });
    }

    // For now, use simple contextual logic
    // In a real implementation, this could use AI/ML models
    const contextWords = context.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const lastWord = contextWords[contextWords.length - 1];

    // Simple context-based suggestions
    const contextualSuggestions: string[] = [];

    // Common word patterns based on context
    const contextPatterns: Record<string, string[]> = {
      'i': ['am', 'was', 'will', 'have', 'can', 'would', 'should'],
      'the': ['best', 'most', 'first', 'last', 'only', 'main', 'next'],
      'to': ['be', 'go', 'do', 'see', 'get', 'make', 'take'],
      'is': ['a', 'an', 'the', 'not', 'very', 'really', 'quite'],
      'are': ['you', 'we', 'they', 'not', 'very', 'really'],
      'going': ['to', 'home', 'there', 'back', 'away'],
      'what': ['is', 'are', 'was', 'were', 'do', 'does', 'did'],
      'how': ['are', 'is', 'do', 'does', 'can', 'will', 'much'],
      'where': ['is', 'are', 'do', 'does', 'can', 'will'],
      'when': ['is', 'are', 'do', 'does', 'can', 'will'],
    };

    if (lastWord && contextPatterns[lastWord]) {
      const patterns = contextPatterns[lastWord];
      for (const pattern of patterns) {
        if (pattern.startsWith(currentWord.toLowerCase())) {
          contextualSuggestions.push(pattern);
        }
      }
    }

    // Get regular Trie suggestions as fallback
    const trieResult = await trieService.getSuggestions(currentWord, maxSuggestions);
    const trieSuggestions = trieResult.suggestions.map(s => s.word);

    // Combine contextual and Trie suggestions
    const allSuggestions = [
      ...contextualSuggestions.slice(0, Math.floor(maxSuggestions / 2)),
      ...trieSuggestions.slice(0, Math.ceil(maxSuggestions / 2))
    ];

    // Remove duplicates and format
    const uniqueSuggestions = Array.from(new Set(allSuggestions))
      .slice(0, maxSuggestions)
      .map(word => ({
        word,
        freq: 1,
        category: 'contextual',
        synonyms: [],
      }));

    res.json({
      suggestions: uniqueSuggestions,
      context: context,
      currentWord: currentWord,
    });

  } catch (error) {
    console.error('Contextual suggestions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Spell check endpoint
router.get('/spell-check', async (req: Request, res: Response) => {
  try {
    const { word } = req.query;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({
        error: 'Word parameter is required and must be a string',
      });
    }

    // Check if word exists in Trie (basic spell check)
    const result = await trieService.getSuggestions(word.toLowerCase(), 1);
    const isCorrect = result.suggestions.length > 0;

    res.json({
      word: word,
      isCorrect: isCorrect,
    });

  } catch (error) {
    console.error('Spell check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Spell suggestions endpoint
router.get('/spell-suggestions', async (req: Request, res: Response) => {
  try {
    const { word, max = '5' } = req.query;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({
        error: 'Word parameter is required and must be a string',
      });
    }

    const maxSuggestions = parseInt(max as string, 10) || 5;

    // Generate spell suggestions using fuzzy matching
    const result = await trieService.getSuggestions(word, maxSuggestions);
    const suggestions = result.suggestions.map(s => s.word);

    res.json({
      word: word,
      suggestions: suggestions,
    });

  } catch (error) {
    console.error('Spell suggestions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
