/**
 * Export endpoint - Export Trie data
 * GET /api/export-trie
 * 
 * Allows exporting the current Trie state for backup or analysis
 */

import { Router, Request, Response } from 'express';
import { TrieService } from '@/services/TrieService';
import { asyncHandler, validateRequest } from '@/utils/middleware';
import { exportQuerySchema } from '@/utils/validation';

const router = Router();
const trieService = TrieService.getInstance();

/**
 * GET /api/export-trie
 * Export the current Trie state as JSON
 * 
 * Query Parameters:
 * - format: string (optional, default: 'json') - Export format
 * - include_metadata: boolean (optional, default: true) - Include metadata
 * 
 * Response:
 * - JSON representation of the Trie structure
 */
router.get('/', 
  validateRequest(exportQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    const { format = 'json', include_metadata = true } = req.query as any;

    try {
      // Export the Trie
      const trieData = trieService.exportTrie();
      const stats = trieService.getTrieStats();
      
      const responseTime = Date.now() - startTime;

      // Prepare export data
      const exportData = {
        export_info: {
          format: format,
          exported_at: new Date().toISOString(),
          export_time_ms: responseTime,
          version: '1.0.0',
        },
        trie_stats: {
          word_count: stats.wordCount,
          total_frequency: stats.totalFrequency,
          avg_frequency: stats.avgFrequency,
          max_depth: stats.maxDepth,
          node_count: stats.nodeCount,
        },
        trie_data: include_metadata ? trieData : {
          ...trieData,
          // Remove metadata if not requested
          root: removeMetadataFromNodes(trieData.root),
        },
      };

      // Set appropriate headers
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="trie-export-${new Date().toISOString().split('T')[0]}.json"`,
        'X-Export-Size': JSON.stringify(exportData).length.toString(),
        'X-Response-Time': `${responseTime}ms`,
      });

      res.json(exportData);

    } catch (error) {
      console.error('Error in export endpoint:', error);
      
      const responseTime = Date.now() - startTime;
      
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Export-Status': 'FAILED',
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to export Trie data',
          code: 'EXPORT_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * GET /api/export-trie/words
 * Export just the words list without Trie structure
 * 
 * Response:
 * - Array of words with their data
 */
router.get('/words', 
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      // Get all words from Trie (this would need to be implemented in TrieService)
      const stats = trieService.getTrieStats();
      
      const responseTime = Date.now() - startTime;

      // For now, return stats and indicate this needs implementation
      const exportData = {
        export_info: {
          format: 'words_list',
          exported_at: new Date().toISOString(),
          export_time_ms: responseTime,
          version: '1.0.0',
        },
        stats: {
          word_count: stats.wordCount,
          total_frequency: stats.totalFrequency,
          avg_frequency: stats.avgFrequency,
        },
        // This would contain the actual words list
        words: [], // TODO: Implement getAllWords() in TrieService
        note: 'Word list export not yet fully implemented',
      };

      res.set({
        'Content-Type': 'application/json',
        'X-Export-Size': JSON.stringify(exportData).length.toString(),
        'X-Response-Time': `${responseTime}ms`,
      });

      res.json(exportData);

    } catch (error) {
      console.error('Error in words export endpoint:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to export words list',
          code: 'WORDS_EXPORT_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * GET /api/export-trie/stats
 * Export just the Trie statistics
 * 
 * Response:
 * - Detailed statistics about the Trie
 */
router.get('/stats', 
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const stats = trieService.getTrieStats();
      const responseTime = Date.now() - startTime;

      const exportData = {
        export_info: {
          format: 'stats',
          exported_at: new Date().toISOString(),
          export_time_ms: responseTime,
          version: '1.0.0',
        },
        trie_stats: {
          word_count: stats.wordCount,
          total_frequency: stats.totalFrequency,
          avg_frequency: stats.avgFrequency,
          max_depth: stats.maxDepth,
          node_count: stats.nodeCount,
        },
        performance_metrics: {
          export_time_ms: responseTime,
          memory_efficiency: stats.nodeCount > 0 ? (stats.wordCount / stats.nodeCount).toFixed(3) : 0,
          avg_word_length: stats.maxDepth > 0 ? (stats.maxDepth / 2).toFixed(1) : 0, // Rough estimate
        },
      };

      res.set({
        'Content-Type': 'application/json',
        'X-Response-Time': `${responseTime}ms`,
      });

      res.json(exportData);

    } catch (error) {
      console.error('Error in stats export endpoint:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to export Trie statistics',
          code: 'STATS_EXPORT_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * Helper function to remove metadata from Trie nodes recursively
 */
function removeMetadataFromNodes(node: any): any {
  if (!node) return node;

  const cleanNode: any = {
    isEndOfWord: node.isEndOfWord,
    freq: node.freq,
  };

  if (node.word) {
    cleanNode.word = node.word;
  }

  if (node.children) {
    cleanNode.children = {};
    for (const [char, childNode] of Object.entries(node.children)) {
      cleanNode.children[char] = removeMetadataFromNodes(childNode);
    }
  }

  return cleanNode;
}

export default router;
