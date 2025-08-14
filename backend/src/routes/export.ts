
import { Router, Request, Response } from 'express';
import { TrieService } from '@/services/TrieService';
import { asyncHandler, validateRequest } from '@/utils/middleware';
import { exportQuerySchema } from '@/utils/validation';

const router = Router();
const trieService = TrieService.getInstance();


router.get('/', 
  validateRequest(exportQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    const { format = 'json', include_metadata = true } = req.query as any;

    try {
      const trieData = trieService.exportTrie();
      const stats = trieService.getTrieStats();
      
      const responseTime = Date.now() - startTime;

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
          root: removeMetadataFromNodes(trieData.root),
        },
      };

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


router.get('/words', 
  asyncHandler(async (_req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const stats = trieService.getTrieStats();
      
      const responseTime = Date.now() - startTime;

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
        words: [], 
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


router.get('/stats', 
  asyncHandler(async (_req: Request, res: Response) => {
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
