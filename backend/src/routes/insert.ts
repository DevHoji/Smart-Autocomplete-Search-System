
import { Router, Request, Response } from 'express';
import { TrieService } from '@/services/TrieService';
import { asyncHandler, validateRequest } from '@/utils/middleware';
import { insertBodySchema } from '@/utils/validation';
import { InsertRequest } from '@/types';

const router = Router();
const trieService = TrieService.getInstance();

router.post('/', 
  validateRequest(insertBodySchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    const { 
      word, 
      freq = 1, 
      category, 
      synonyms, 
      metadata, 
      user_id 
    } = req.body as InsertRequest;
    
    const userId = user_id || req.headers['x-user-id'] as string;

    try {
      const result = await trieService.insertWord(
        word,
        freq,
        category,
        synonyms,
        metadata,
        userId
      );
      
      const responseTime = Date.now() - startTime;

      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Insert-Status': 'SUCCESS',
      });

      res.status(201).json({
        success: result.success,
        word: result.word,
        message: `Word '${result.word}' added successfully`,
        data: {
          word: result.word,
          freq: freq,
          category: category || null,
          synonyms: synonyms || null,
          metadata: metadata || null,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error in insert endpoint:', error);
      
      const responseTime = Date.now() - startTime;
      
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Insert-Status': 'FAILED',
      });

      if (error instanceof Error) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            error: {
              message: `Word '${word}' already exists`,
              code: 'WORD_EXISTS',
            },
            word: word,
            timestamp: new Date().toISOString(),
          });
        } else if (error.message.includes('validation')) {
          res.status(400).json({
            success: false,
            error: {
              message: 'Invalid word data',
              code: 'VALIDATION_ERROR',
              details: error.message,
            },
            word: word,
            timestamp: new Date().toISOString(),
          });
        } else {
          res.status(500).json({
            success: false,
            error: {
              message: 'Failed to insert word',
              code: 'INSERT_ERROR',
            },
            word: word,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        res.status(500).json({
          success: false,
          error: {
            message: 'Unknown error occurred',
            code: 'UNKNOWN_ERROR',
          },
          word: word,
          timestamp: new Date().toISOString(),
        });
      }
    }
  })
);


router.post('/batch', 
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    const { words } = req.body;
    
    if (!Array.isArray(words)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Words must be an array',
          code: 'INVALID_INPUT',
        },
      });
    }

    if (words.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least one word is required',
          code: 'EMPTY_WORDS',
        },
      });
    }

    if (words.length > 1000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot process more than 1000 words at once',
          code: 'TOO_MANY_WORDS',
        },
      });
    }

    const results = [];
    let successful = 0;

    try {
      for (const wordData of words) {
        try {
          const { error } = insertBodySchema.validate(wordData);
          if (error) {
            results.push({
              word: wordData.word || 'unknown',
              success: false,
              error: error.details[0]?.message || 'Validation failed',
            });
            continue;
          }

          const result = await trieService.insertWord(
            wordData.word,
            wordData.freq || 1,
            wordData.category,
            wordData.synonyms,
            wordData.metadata,
            wordData.user_id
          );

          results.push({
            word: result.word,
            success: result.success,
          });

          if (result.success) {
            successful++;
          }

        } catch (error) {
          results.push({
            word: wordData.word || 'unknown',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const responseTime = Date.now() - startTime;
      
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Batch-Size': words.length.toString(),
        'X-Success-Rate': `${(successful / words.length * 100).toFixed(1)}%`,
      });

      const statusCode = successful === words.length ? 201 : 207; 

      res.status(statusCode).json({
        success: successful === words.length,
        results: results,
        total: words.length,
        successful: successful,
        failed: words.length - successful,
        message: `Processed ${words.length} words, ${successful} successful`,
        timestamp: new Date().toISOString(),
      });
      return;

    } catch (error) {
      console.error('Error in batch insert endpoint:', error);

      const responseTime = Date.now() - startTime;

      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Batch-Status': 'FAILED',
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to process batch insertions',
          code: 'BATCH_ERROR',
        },
        results: results,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  })
);


router.delete('/:word', 
  asyncHandler(async (req: Request, res: Response) => {
    const { word } = req.params;
    
    if (!word || word.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Word parameter is required',
          code: 'MISSING_WORD',
        },
      });
    }

    try {
      
      res.status(501).json({
        success: false,
        error: {
          message: 'Word deletion not yet implemented',
          code: 'NOT_IMPLEMENTED',
        },
        word: word,
        timestamp: new Date().toISOString(),
      });
      return;

    } catch (error) {
      console.error('Error in delete word endpoint:', error);

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete word',
          code: 'DELETE_ERROR',
        },
        word: word,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  })
);

export default router;
