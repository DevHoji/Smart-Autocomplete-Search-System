/**
 * TrieService - Business logic layer for Trie operations
 * 
 * This service manages the in-memory Trie instance and provides:
 * - Singleton Trie instance management
 * - Database synchronization
 * - Real-time updates via Socket.IO
 * - Analytics tracking
 * - Error handling and validation
 */

import { Trie } from '@/models/Trie';
import { getDatabase } from '@/utils/database';
import { Word, TrieSuggestion, SearchLog, AnalyticsStats } from '@/types';
import { Server as SocketIOServer } from 'socket.io';
import { FuzzyService } from './fuzzyService';

export class TrieService {
  private static instance: TrieService;
  private trie: Trie;
  private io?: SocketIOServer;
  private fuzzyService: FuzzyService;

  private constructor() {
    this.trie = new Trie();
    this.fuzzyService = FuzzyService.getInstance();
  }

  /**
   * Get singleton instance of TrieService
   */
  public static getInstance(): TrieService {
    if (!TrieService.instance) {
      TrieService.instance = new TrieService();
    }
    return TrieService.instance;
  }

  /**
   * Initialize the service with Socket.IO instance
   */
  public initialize(io: SocketIOServer): void {
    this.io = io;
    // Initialize FuzzyService with this TrieService instance
    this.fuzzyService.initialize(this);
  }

  /**
   * Load words from database into Trie
   * Called during server startup
   */
  public async loadFromDatabase(): Promise<void> {
    const db = getDatabase();
    
    try {
      const result = await db.query<Word>(`
        SELECT word, freq, category, synonyms, metadata, created_at, updated_at
        FROM words 
        ORDER BY freq DESC
      `);

      console.log(`Loading ${result.rows.length} words into Trie...`);
      
      for (const row of result.rows) {
        this.trie.insert(row.word, row.freq, {
          category: row.category,
          synonyms: row.synonyms,
          ...row.metadata,
        });
      }

      const stats = this.trie.getStats();
      console.log(`Trie loaded successfully:`, stats);

      // Update fuzzy search cache after Trie is loaded
      this.fuzzyService.refreshCache();

    } catch (error) {
      console.error('Failed to load words from database:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions for a prefix with fuzzy fallback
   */
  public async getSuggestions(
    prefix: string,
    k: number = 10,
    category?: string,
    userId?: string
  ): Promise<{
    suggestions: TrieSuggestion[];
    prefix: string;
    total: number;
    fuzzy: boolean;
  }> {
    const startTime = Date.now();

    try {
      // First try exact prefix matching
      const exactSuggestions = this.trie.topK(prefix, k, category);

      // If we have enough exact matches, return them
      if (exactSuggestions.length >= k || !this.fuzzyService.shouldUseFuzzySearch(prefix, exactSuggestions.length)) {
        const responseTime = Date.now() - startTime;
        await this.logSearch(prefix, exactSuggestions.length, responseTime, userId);

        return {
          suggestions: exactSuggestions,
          prefix,
          total: exactSuggestions.length,
          fuzzy: false,
        };
      }

      // Use hybrid approach: combine exact and fuzzy matches
      const hybridResult = await this.fuzzyService.getHybridSuggestions(prefix, k, category);
      const responseTime = Date.now() - startTime;

      // Log the search for analytics
      await this.logSearch(prefix, hybridResult.suggestions.length, responseTime, userId, hybridResult.fuzzy);

      return {
        suggestions: hybridResult.suggestions,
        prefix,
        total: hybridResult.suggestions.length,
        fuzzy: hybridResult.fuzzy,
      };

    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }

  /**
   * Record a suggestion selection (learning)
   */
  public async selectSuggestion(
    word: string, 
    prefix: string, 
    userId?: string
  ): Promise<{ success: boolean; newFreq: number }> {
    const db = getDatabase();
    
    try {
      // Increment frequency in Trie
      const newFreq = this.trie.incrementFrequency(word, 1);
      
      if (newFreq === -1) {
        throw new Error(`Word '${word}' not found in Trie`);
      }

      // Update database
      await db.query(`
        UPDATE words 
        SET freq = freq + 1, 
            last_selected = NOW(),
            updated_at = NOW()
        WHERE word = $1
      `, [word]);

      // Log the selection for analytics
      await this.logSelection(word, prefix, userId);

      // Emit real-time update
      this.emitTrieUpdate('update', word, newFreq);

      return { success: true, newFreq };
      
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      throw error;
    }
  }

  /**
   * Insert a new word into the Trie and database
   */
  public async insertWord(
    word: string,
    freq: number = 1,
    category?: string,
    synonyms?: string[],
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<{ success: boolean; word: string }> {
    const db = getDatabase();
    
    try {
      // Insert into Trie
      this.trie.insert(word, freq, {
        category,
        synonyms,
        ...metadata,
      });

      // Insert into database
      await db.query(`
        INSERT INTO words (word, freq, category, synonyms, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (word) 
        DO UPDATE SET 
          freq = words.freq + $2,
          updated_at = NOW()
      `, [word, freq, category, synonyms, metadata]);

      // Log the insertion
      await this.logSearch(word, 1, 0, userId, 'insert');

      // Emit real-time update
      this.emitTrieUpdate('insert', word, freq);

      return { success: true, word };
      
    } catch (error) {
      console.error('Error inserting word:', error);
      throw error;
    }
  }

  /**
   * Export Trie as JSON
   */
  public exportTrie(): any {
    return this.trie.toJSON();
  }

  /**
   * Get Trie statistics
   */
  public getTrieStats(): any {
    return this.trie.getStats();
  }

  /**
   * Get all words from Trie (used by FuzzyService)
   */
  public getAllWords(): TrieSuggestion[] {
    return this.trie.getAllWords();
  }

  /**
   * Get direct suggestions from Trie without fuzzy fallback (used by FuzzyService)
   */
  public getDirectSuggestions(prefix: string, k: number = 10, category?: string): TrieSuggestion[] {
    return this.trie.topK(prefix, k, category);
  }

  /**
   * Get analytics data
   */
  public async getAnalytics(days: number = 7): Promise<AnalyticsStats> {
    const db = getDatabase();
    
    try {
      // Get total searches and selections
      const totalsResult = await db.query(`
        SELECT 
          COUNT(*) as total_searches,
          COUNT(selected_word_id) as total_selections,
          AVG(response_time_ms) as avg_response_time
        FROM search_logs 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
      `);

      const totals = totalsResult.rows[0];
      const successRate = totals.total_searches > 0 
        ? (totals.total_selections / totals.total_searches) * 100 
        : 0;

      // Get top queries
      const topQueriesResult = await db.query(`
        SELECT query_text, COUNT(*) as count
        FROM search_logs 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
          AND query_text IS NOT NULL
        GROUP BY query_text
        ORDER BY count DESC
        LIMIT 10
      `);

      // Get top words by frequency
      const topWordsResult = await db.query(`
        SELECT w.word, w.freq, COUNT(sl.selected_word_id) as selections
        FROM words w
        LEFT JOIN search_logs sl ON w.id = sl.selected_word_id
          AND sl.created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY w.id, w.word, w.freq
        ORDER BY w.freq DESC
        LIMIT 10
      `);

      // Get trending words (words with recent activity)
      const trendingResult = await db.query(`
        SELECT 
          w.word,
          COUNT(sl.id) as recent_selections,
          (COUNT(sl.id)::float / GREATEST(w.freq, 1)) * 100 as growth_rate
        FROM words w
        LEFT JOIN search_logs sl ON w.id = sl.selected_word_id
          AND sl.created_at >= NOW() - INTERVAL '${days} days'
        WHERE w.updated_at >= NOW() - INTERVAL '${days} days'
        GROUP BY w.id, w.word, w.freq
        HAVING COUNT(sl.id) > 0
        ORDER BY growth_rate DESC
        LIMIT 10
      `);

      return {
        total_searches: parseInt(totals.total_searches),
        total_selections: parseInt(totals.total_selections),
        success_rate: parseFloat(successRate.toFixed(2)),
        avg_response_time: parseFloat(totals.avg_response_time || 0),
        top_queries: topQueriesResult.rows.map(row => ({
          query: row.query_text,
          count: parseInt(row.count),
        })),
        top_words: topWordsResult.rows.map(row => ({
          word: row.word,
          freq: parseInt(row.freq),
          selections: parseInt(row.selections),
        })),
        trending_words: trendingResult.rows.map(row => ({
          word: row.word,
          recent_selections: parseInt(row.recent_selections),
          growth_rate: parseFloat(row.growth_rate),
        })),
      };
      
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Log search query for analytics
   */
  private async logSearch(
    query: string,
    resultCount: number,
    responseTime: number,
    userId?: string,
    fuzzy: boolean | string = false
  ): Promise<void> {
    const db = getDatabase();

    try {
      // Convert fuzzy parameter to appropriate type
      const searchType = typeof fuzzy === 'string' ? fuzzy : (fuzzy ? 'fuzzy' : 'exact');

      await db.query(`
        INSERT INTO search_logs (query_text, user_id, result_count, response_time_ms, search_type, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [query, userId, resultCount, responseTime, searchType]);

    } catch (error) {
      // Don't throw on logging errors, just log them
      console.error('Failed to log search:', error);
    }
  }

  /**
   * Log suggestion selection for analytics
   */
  private async logSelection(
    word: string, 
    prefix: string, 
    userId?: string
  ): Promise<void> {
    const db = getDatabase();
    
    try {
      // Get word ID
      const wordResult = await db.query(`
        SELECT id FROM words WHERE word = $1
      `, [word]);

      if (wordResult.rows.length > 0) {
        await db.query(`
          INSERT INTO search_logs (query_text, user_id, result_count, selected_word_id, created_at)
          VALUES ($1, $2, 1, $3, NOW())
        `, [prefix, userId, wordResult.rows[0].id]);
      }
      
    } catch (error) {
      // Don't throw on logging errors, just log them
      console.error('Failed to log selection:', error);
    }
  }

  /**
   * Emit real-time Trie update via Socket.IO
   */
  private emitTrieUpdate(
    type: 'insert' | 'update' | 'delete', 
    word: string, 
    freq?: number
  ): void {
    if (this.io) {
      this.io.to('trie-updates').emit('trie:update', {
        type,
        word,
        freq,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
