/**
 * Select endpoint - Learning functionality
 * POST /api/select
 * 
 * Records when a user selects a suggestion, incrementing its frequency
 * This enables the system to learn and improve suggestions over time
 */

import { Router, Request, Response } from 'express';
import { TrieService } from '@/services/TrieService';
import { asyncHandler, validateRequest } from '@/utils/middleware';
import { selectBodySchema } from '@/utils/validation';
import { SelectRequest } from '@/types';

const router = Router();
const trieService = TrieService.getInstance();

/**
 * POST /api/select
 * Record a suggestion selection for learning
 * 
 * Body:
 * - word: string (required) - The selected word
 * - prefix: string (required) - The prefix that was searched
 * - user_id: string (optional) - User identifier for analytics
 * 
 * Response:
 * - success: boolean - Whether the selection was recorded
 * - newFreq: number - New frequency of the selected word
 * - word: string - The selected word
 */
router.post('/', 
  validateRequest(selectBodySchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    // Extract request data
    const { word, prefix, user_id } = req.body as SelectRequest;
    const userId = user_id || req.headers['x-user-id'] as string;

    try {
      // Record the selection
      const result = await trieService.selectSuggestion(word, prefix, userId);
      
      const responseTime = Date.now() - startTime;

      // Add performance headers
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Learning-Status': 'SUCCESS',
      });

      // Return success response
      res.json({
        success: result.success,
        newFreq: result.newFreq,
        word: word,
        message: `Selection recorded for '${word}'`,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error in select endpoint:', error);
      
      const responseTime = Date.now() - startTime;
      
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Learning-Status': 'FAILED',
      });

      // Check if it's a word not found error
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: {
            message: `Word '${word}' not found in vocabulary`,
            code: 'WORD_NOT_FOUND',
          },
          word: word,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            message: 'Failed to record selection',
            code: 'SELECTION_ERROR',
          },
          word: word,
          timestamp: new Date().toISOString(),
        });
      }
    }
  })
);

/**
 * POST /api/select/batch
 * Record multiple selections at once
 * 
 * Body:
 * - selections: Array of SelectRequest objects
 * 
 * Response:
 * - success: boolean - Whether all selections were recorded
 * - results: Array of individual results
 * - total: number - Total selections processed
 * - successful: number - Number of successful selections
 */
router.post('/batch', 
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    const { selections } = req.body;
    
    if (!Array.isArray(selections)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Selections must be an array',
          code: 'INVALID_INPUT',
        },
      });
    }

    if (selections.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least one selection is required',
          code: 'EMPTY_SELECTIONS',
        },
      });
    }

    if (selections.length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot process more than 100 selections at once',
          code: 'TOO_MANY_SELECTIONS',
        },
      });
    }

    const results = [];
    let successful = 0;

    try {
      // Process each selection
      for (const selection of selections) {
        try {
          // Validate individual selection
          const { error } = selectBodySchema.validate(selection);
          if (error) {
            results.push({
              word: selection.word || 'unknown',
              success: false,
              error: error.details[0]?.message || 'Validation failed',
            });
            continue;
          }

          // Record the selection
          const result = await trieService.selectSuggestion(
            selection.word,
            selection.prefix,
            selection.user_id
          );

          results.push({
            word: selection.word,
            success: result.success,
            newFreq: result.newFreq,
          });

          if (result.success) {
            successful++;
          }

        } catch (error) {
          results.push({
            word: selection.word || 'unknown',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const responseTime = Date.now() - startTime;
      
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Batch-Size': selections.length.toString(),
        'X-Success-Rate': `${(successful / selections.length * 100).toFixed(1)}%`,
      });

      res.json({
        success: successful === selections.length,
        results: results,
        total: selections.length,
        successful: successful,
        failed: selections.length - successful,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error in batch select endpoint:', error);
      
      const responseTime = Date.now() - startTime;
      
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Batch-Status': 'FAILED',
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to process batch selections',
          code: 'BATCH_ERROR',
        },
        results: results,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

export default router;
