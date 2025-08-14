
import { Router, Request, Response } from 'express';
import { TrieService } from '@/services/TrieService';
import { asyncHandler, validateRequest } from '@/utils/middleware';
import { analyticsQuerySchema } from '@/utils/validation';

const router = Router();
const trieService = TrieService.getInstance();

router.get('/stats', 
  validateRequest(analyticsQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    const { days = 7 } = req.query as any;

    try {
      const analytics = await trieService.getAnalytics(parseInt(days.toString()));
      const trieStats = trieService.getTrieStats();
      
      const responseTime = Date.now() - startTime;

      const analyticsData = {
        period: {
          days: parseInt(days.toString()),
          start_date: new Date(Date.now() - (parseInt(days.toString()) * 24 * 60 * 60 * 1000)).toISOString(),
          end_date: new Date().toISOString(),
        },
        search_analytics: {
          total_searches: analytics.total_searches,
          total_selections: analytics.total_selections,
          success_rate: analytics.success_rate,
          avg_response_time: analytics.avg_response_time,
        },
        top_queries: analytics.top_queries,
        top_words: analytics.top_words,
        trending_words: analytics.trending_words,
        trie_stats: {
          word_count: trieStats.wordCount,
          total_frequency: trieStats.totalFrequency,
          avg_frequency: trieStats.avgFrequency,
          max_depth: trieStats.maxDepth,
          node_count: trieStats.nodeCount,
        },
        performance: {
          query_time_ms: responseTime,
          memory_efficiency: trieStats.nodeCount > 0 ? (trieStats.wordCount / trieStats.nodeCount).toFixed(3) : 0,
        },
        generated_at: new Date().toISOString(),
      };

      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Analytics-Period': `${days} days`,
      });

      res.json(analyticsData);

    } catch (error) {
      console.error('Error in admin stats endpoint:', error);
      
      const responseTime = Date.now() - startTime;
      
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Analytics-Status': 'FAILED',
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve analytics data',
          code: 'ANALYTICS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  })
);


router.get('/health', 
  asyncHandler(async (_req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const trieStats = trieService.getTrieStats();
      const responseTime = Date.now() - startTime;

      const isHealthy = trieStats.wordCount > 0;
      const status = isHealthy ? 'healthy' : 'degraded';

      const healthData = {
        status: status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        components: {
          trie: {
            status: trieStats.wordCount > 0 ? 'healthy' : 'unhealthy',
            word_count: trieStats.wordCount,
            loaded: trieStats.wordCount > 0,
            avg_frequency: trieStats.avgFrequency,
          },
          database: {
            status: 'unknown', 
            connected: true, 
          },
          memory: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal,
            external: process.memoryUsage().external,
          },
        },
        performance: {
          response_time_ms: responseTime,
          node_version: process.version,
          platform: process.platform,
        },
        diagnostics: {
          trie_efficiency: trieStats.nodeCount > 0 ? (trieStats.wordCount / trieStats.nodeCount).toFixed(3) : 0,
          max_depth: trieStats.maxDepth,
          node_count: trieStats.nodeCount,
        },
      };

      
      const statusCode = isHealthy ? 200 : 503;

      res.status(statusCode).json(healthData);

    } catch (error) {
      console.error('Error in admin health endpoint:', error);
      
      const responseTime = Date.now() - startTime;

      res.status(503).json({
        status: 'unhealthy',
        error: {
          message: 'Health check failed',
          code: 'HEALTH_CHECK_ERROR',
        },
        timestamp: new Date().toISOString(),
        performance: {
          response_time_ms: responseTime,
        },
      });
    }
  })
);


router.get('/system', 
  asyncHandler(async (_req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const memUsage = process.memoryUsage();
      const responseTime = Date.now() - startTime;

      const systemInfo = {
        runtime: {
          node_version: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime(),
          pid: process.pid,
        },
        memory: {
          heap_used: memUsage.heapUsed,
          heap_total: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss,
          heap_used_mb: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
          heap_total_mb: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
        },
        environment: {
          node_env: process.env['NODE_ENV'] || 'unknown',
          port: process.env['PORT'] || 'unknown',
        },
        performance: {
          response_time_ms: responseTime,
        },
        timestamp: new Date().toISOString(),
      };

      res.json(systemInfo);

    } catch (error) {
      console.error('Error in admin system endpoint:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve system information',
          code: 'SYSTEM_INFO_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  })
);


router.post('/reload', 
  asyncHandler(async (_req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      
      const trieStats = trieService.getTrieStats();
      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        message: 'Trie reload initiated (not yet implemented)',
        stats: trieStats,
        reload_time_ms: responseTime,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error in admin reload endpoint:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to reload Trie',
          code: 'RELOAD_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  })
);

export default router;
