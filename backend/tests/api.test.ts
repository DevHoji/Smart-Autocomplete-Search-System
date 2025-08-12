/**
 * Integration tests for API endpoints
 * Tests the REST API functionality and database integration
 */

import request from 'supertest';
import { app } from '../src/index';
import { dbService } from '../src/services/dbService';

describe('API Endpoints', () => {
  beforeAll(async () => {
    // Initialize test database
    await dbService.initializeDatabase();
  });

  afterAll(async () => {
    // Clean up database connections
    await dbService.close();
  });

  describe('Health Check', () => {
    test('GET /health should return system status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Autocomplete Suggestions', () => {
    test('GET /api/suggest should return suggestions', async () => {
      const response = await request(app)
        .get('/api/suggest?prefix=prog&k=5')
        .expect(200);

      expect(response.body).toHaveProperty('suggestions');
      expect(response.body).toHaveProperty('prefix', 'prog');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('fuzzy', false);
      expect(Array.isArray(response.body.suggestions)).toBe(true);
    });

    test('GET /api/suggest should handle empty prefix', async () => {
      const response = await request(app)
        .get('/api/suggest?prefix=&k=3')
        .expect(200);

      expect(response.body.suggestions).toHaveLength(3);
    });

    test('GET /api/suggest should handle category filter', async () => {
      const response = await request(app)
        .get('/api/suggest?prefix=prog&k=5&category=technology')
        .expect(200);

      expect(response.body.suggestions.every((s: any) => 
        s.category === 'technology' || !s.category
      )).toBe(true);
    });

    test('GET /api/suggest should validate parameters', async () => {
      // Test invalid k parameter
      await request(app)
        .get('/api/suggest?prefix=test&k=-1')
        .expect(400);

      // Test missing prefix
      await request(app)
        .get('/api/suggest?k=5')
        .expect(400);
    });

    test('GET /api/suggest should handle non-existent prefix', async () => {
      const response = await request(app)
        .get('/api/suggest?prefix=xyzzzzz&k=5')
        .expect(200);

      expect(response.body.suggestions).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('Word Selection', () => {
    test('POST /api/select should record selection', async () => {
      const response = await request(app)
        .post('/api/select')
        .send({
          word: 'programming',
          query: 'prog',
          userId: 'test-user'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    test('POST /api/select should validate required fields', async () => {
      // Test missing word
      await request(app)
        .post('/api/select')
        .send({
          query: 'prog',
          userId: 'test-user'
        })
        .expect(400);

      // Test empty word
      await request(app)
        .post('/api/select')
        .send({
          word: '',
          query: 'prog',
          userId: 'test-user'
        })
        .expect(400);
    });

    test('POST /api/select should handle non-existent word', async () => {
      const response = await request(app)
        .post('/api/select')
        .send({
          word: 'nonexistentword123',
          query: 'nonex',
          userId: 'test-user'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Analytics', () => {
    test('GET /api/admin/stats should return analytics data', async () => {
      const response = await request(app)
        .get('/api/admin/stats?days=7')
        .expect(200);

      expect(response.body).toHaveProperty('search_analytics');
      expect(response.body).toHaveProperty('trie_stats');
      expect(response.body).toHaveProperty('top_queries');
      expect(response.body).toHaveProperty('top_words');
      expect(response.body).toHaveProperty('trending_words');
      expect(response.body).toHaveProperty('performance');

      // Validate search analytics structure
      const searchAnalytics = response.body.search_analytics;
      expect(searchAnalytics).toHaveProperty('total_searches');
      expect(searchAnalytics).toHaveProperty('total_selections');
      expect(searchAnalytics).toHaveProperty('avg_response_time');
      expect(searchAnalytics).toHaveProperty('success_rate');

      // Validate trie stats structure
      const trieStats = response.body.trie_stats;
      expect(trieStats).toHaveProperty('word_count');
      expect(trieStats).toHaveProperty('total_frequency');
      expect(trieStats).toHaveProperty('avg_frequency');
      expect(trieStats).toHaveProperty('max_depth');
      expect(trieStats).toHaveProperty('node_count');
    });

    test('GET /api/admin/stats should handle different time periods', async () => {
      const periods = [1, 7, 30, 90];
      
      for (const days of periods) {
        const response = await request(app)
          .get(`/api/admin/stats?days=${days}`)
          .expect(200);

        expect(response.body).toHaveProperty('search_analytics');
        expect(typeof response.body.search_analytics.total_searches).toBe('number');
      }
    });

    test('GET /api/admin/stats should validate days parameter', async () => {
      // Test invalid days parameter
      await request(app)
        .get('/api/admin/stats?days=0')
        .expect(400);

      await request(app)
        .get('/api/admin/stats?days=-1')
        .expect(400);

      await request(app)
        .get('/api/admin/stats?days=abc')
        .expect(400);
    });

    test('GET /api/admin/stats should use default period when not specified', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .expect(200);

      expect(response.body).toHaveProperty('search_analytics');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    test('should handle malformed JSON in POST requests', async () => {
      await request(app)
        .post('/api/select')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    test('should handle CORS preflight requests', async () => {
      await request(app)
        .options('/api/suggest')
        .expect(200);
    });
  });

  describe('Performance', () => {
    test('API responses should be fast', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/suggest?prefix=test&k=10')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should respond within 100ms
    });

    test('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map((_, i) =>
        request(app)
          .get(`/api/suggest?prefix=test${i}&k=5`)
          .expect(200)
      );

      const responses = await Promise.all(requests);
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.body).toHaveProperty('suggestions');
      });
    });
  });

  describe('Rate Limiting', () => {
    test('should handle multiple requests from same IP', async () => {
      // Make multiple requests quickly
      const requests = Array(20).fill(null).map(() =>
        request(app)
          .get('/api/suggest?prefix=test&k=5')
      );

      const responses = await Promise.all(requests);
      
      // All should succeed (no rate limiting implemented yet)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });
});
