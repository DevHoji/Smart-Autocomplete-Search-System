

import { Router, Request, Response } from 'express';
import { TrieService } from '@/services/TrieService';
import { asyncHandler, validateRequest } from '@/utils/middleware';
import { suggestQuerySchema } from '@/utils/validation';
import { SuggestResponse } from '@/types';

const router = Router();
const trieService = TrieService.getInstance();


router.get('/', 
  validateRequest(suggestQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    const { prefix, k = 10, category } = req.query as any;
    const userId = req.headers['x-user-id'] as string;

    try {
   
      const result = await trieService.getSuggestions(
        prefix,
        parseInt(k.toString()),
        category,
        userId
      );

      const responseTime = Date.now() - startTime;

      if (!result || !result.suggestions) {
        throw new Error('Invalid result from suggestion service');
      }

      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Suggestion-Count': result.suggestions.length.toString(),
        'X-Cache-Status': 'HIT', 
      });

      const response: SuggestResponse = {
        suggestions: result.suggestions,
        prefix: result.prefix,
        total: result.total,
        fuzzy: result.fuzzy,
      };

      res.json(response);

    } catch (error) {
      console.error('Error in suggest endpoint:', error);
      
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


router.get('/stats', 
  asyncHandler(async (_req: Request, res: Response) => {
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


router.get('/health', 
  asyncHandler(async (_req: Request, res: Response) => {
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

   
    const contextWords = context.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const lastWord = contextWords[contextWords.length - 1];

    const contextualSuggestions: string[] = [];

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

    const trieResult = await trieService.getSuggestions(currentWord, maxSuggestions);
    const trieSuggestions = trieResult.suggestions.map(s => s.word);

    const allSuggestions = [
      ...contextualSuggestions.slice(0, Math.floor(maxSuggestions / 2)),
      ...trieSuggestions.slice(0, Math.ceil(maxSuggestions / 2))
    ];

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
    return;

  } catch (error) {
    console.error('Contextual suggestions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

router.get('/spell-check', async (req: Request, res: Response) => {
  try {
    const { word } = req.query;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({
        error: 'Word parameter is required and must be a string',
      });
    }

    const exactMatch = trieService.searchExact(word.toLowerCase());
    const isCorrect = exactMatch !== null;

    res.json({
      word: word,
      isCorrect: isCorrect,
    });
    return;

  } catch (error) {
    console.error('Spell check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

router.get('/spell-suggestions', async (req: Request, res: Response) => {
  try {
    const { word, max = '5' } = req.query;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({
        error: 'Word parameter is required and must be a string',
      });
    }

    const maxSuggestions = parseInt(max as string, 10) || 5;

    const result = await trieService.getSuggestions(word, maxSuggestions);
    const suggestions = result.suggestions.map(s => s.word);

    res.json({
      word: word,
      suggestions: suggestions,
    });
    return;

  } catch (error) {
    console.error('Spell suggestions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

export default router;
