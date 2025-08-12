/**
 * Fuzzy Matching Service for Smart Autocomplete Search System
 * 
 * Provides fuzzy search capabilities when exact prefix matches fail.
 * Uses Levenshtein distance algorithm for finding similar words.
 * 
 * This service is called as a fallback when:
 * 1. No exact prefix matches are found
 * 2. User makes typos in their input
 * 3. Voice recognition produces imperfect text
 */

import * as levenshtein from 'fast-levenshtein';
import { TrieSuggestion } from '@/types';
import { TrieService } from './TrieService';

export interface FuzzyMatch {
  word: string;
  freq: number;
  distance: number;
  category?: string;
  synonyms?: string[];
  metadata?: Record<string, any>;
}

export interface FuzzySearchOptions {
  maxDistance?: number;      // Maximum edit distance (default: 2)
  maxResults?: number;       // Maximum results to return (default: 10)
  minFrequency?: number;     // Minimum word frequency to consider (default: 1)
  category?: string;         // Category filter
  preferShorterWords?: boolean; // Prefer shorter words for same distance (default: true)
}

/**
 * Fuzzy Search Service
 * 
 * Implementation Strategy:
 * 1. Get all words from Trie (or top N frequent words for performance)
 * 2. Calculate Levenshtein distance for each word
 * 3. Filter by maximum distance threshold
 * 4. Sort by distance (primary) and frequency (secondary)
 * 5. Return top K results
 */
export class FuzzyService {
  private static instance: FuzzyService;
  private trieService?: TrieService;
  private frequentWords: TrieSuggestion[] = [];
  private lastCacheUpdate: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_WORDS_FOR_FUZZY = 5000; // Limit for performance

  private constructor() {
    // Don't initialize TrieService here to avoid circular dependency
  }

  public static getInstance(): FuzzyService {
    if (!FuzzyService.instance) {
      FuzzyService.instance = new FuzzyService();
    }
    return FuzzyService.instance;
  }

  /**
   * Initialize the service with TrieService (called after TrieService is ready)
   */
  public initialize(trieService: TrieService): void {
    this.trieService = trieService;
    this.updateFrequentWordsCache();
  }

  /**
   * Perform fuzzy search for a query
   * 
   * @param query - The search query (potentially misspelled)
   * @param options - Search options and filters
   * @returns Array of fuzzy matches sorted by relevance
   */
  public async fuzzySearch(
    query: string, 
    options: FuzzySearchOptions = {}
  ): Promise<FuzzyMatch[]> {
    const {
      maxDistance = 2,
      maxResults = 10,
      minFrequency = 1,
      category,
      preferShorterWords = true,
    } = options;

    if (!query || query.trim().length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // Update cache if needed
    this.updateCacheIfNeeded();

    // Get candidate words (use cache for performance)
    const candidates = this.getCandidateWords(minFrequency, category);

    // Calculate distances and filter
    const matches: FuzzyMatch[] = [];

    for (const candidate of candidates) {
      const distance = levenshtein.get(normalizedQuery, candidate.word);
      
      if (distance <= maxDistance) {
        matches.push({
          word: candidate.word,
          freq: candidate.freq,
          distance,
          category: candidate.category,
          synonyms: candidate.synonyms,
          metadata: candidate.metadata,
        });
      }
    }

    // Sort by relevance: distance (ascending), then frequency (descending), then length (ascending if preferred)
    matches.sort((a, b) => {
      // Primary: distance (lower is better)
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      
      // Secondary: frequency (higher is better)
      if (a.freq !== b.freq) {
        return b.freq - a.freq;
      }
      
      // Tertiary: word length (shorter is better if preferShorterWords is true)
      if (preferShorterWords) {
        return a.word.length - b.word.length;
      }
      
      return 0;
    });

    return matches.slice(0, maxResults);
  }

  /**
   * Check if fuzzy search should be used for a query
   * 
   * @param query - The search query
   * @param exactMatches - Number of exact prefix matches found
   * @returns true if fuzzy search should be performed
   */
  public shouldUseFuzzySearch(query: string, exactMatches: number): boolean {
    // Use fuzzy search if:
    // 1. No exact matches found
    // 2. Query is at least 3 characters (avoid noise for short queries)
    // 3. Query doesn't look like a prefix (contains common typo patterns)
    
    if (exactMatches > 0) {
      return false; // Have exact matches, no need for fuzzy
    }

    if (query.length < 3) {
      return false; // Too short for meaningful fuzzy matching
    }

    return true;
  }

  /**
   * Get suggestions that combine exact and fuzzy matches
   *
   * @param query - The search query
   * @param maxResults - Maximum total results
   * @param category - Optional category filter
   * @returns Combined suggestions with fuzzy flag
   */
  public async getHybridSuggestions(
    query: string,
    maxResults: number = 10,
    category?: string
  ): Promise<{ suggestions: TrieSuggestion[]; fuzzy: boolean }> {
    if (!this.trieService) {
      throw new Error('FuzzyService not initialized with TrieService');
    }

    // First try exact prefix matching (use direct Trie access to avoid circular calls)
    const exactSuggestions = this.trieService.getDirectSuggestions(query, maxResults, category);

    if (exactSuggestions.length >= maxResults || !this.shouldUseFuzzySearch(query, exactSuggestions.length)) {
      return {
        suggestions: exactSuggestions,
        fuzzy: false,
      };
    }

    // Add fuzzy matches to fill remaining slots
    const remainingSlots = maxResults - exactSuggestions.length;
    const fuzzyMatches = await this.fuzzySearch(query, {
      maxResults: remainingSlots,
      category,
      maxDistance: 2,
    });

    // Convert fuzzy matches to suggestions format
    const fuzzySuggestions: TrieSuggestion[] = fuzzyMatches.map(match => ({
      word: match.word,
      freq: match.freq,
      category: match.category,
      synonyms: match.synonyms,
      metadata: match.metadata,
    }));

    // Combine exact and fuzzy results
    const combinedSuggestions = [...exactSuggestions, ...fuzzySuggestions];

    return {
      suggestions: combinedSuggestions,
      fuzzy: fuzzyMatches.length > 0,
    };
  }

  /**
   * Update the cache of frequent words for fuzzy matching
   */
  private updateFrequentWordsCache(): void {
    if (!this.trieService) {
      console.log('TrieService not available, skipping cache update');
      return;
    }

    try {
      // Get all words from Trie, sorted by frequency
      const allWords = this.trieService.getAllWords();

      // Take top N words for performance
      this.frequentWords = allWords.slice(0, this.MAX_WORDS_FOR_FUZZY);
      this.lastCacheUpdate = Date.now();

      console.log(`Fuzzy search cache updated with ${this.frequentWords.length} words`);
    } catch (error) {
      console.error('Error updating fuzzy search cache:', error);
    }
  }

  /**
   * Update cache if TTL has expired
   */
  private updateCacheIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastCacheUpdate > this.CACHE_TTL) {
      this.updateFrequentWordsCache();
    }
  }

  /**
   * Get candidate words for fuzzy matching
   */
  private getCandidateWords(minFrequency: number, category?: string): TrieSuggestion[] {
    let candidates = this.frequentWords;

    // Filter by minimum frequency
    if (minFrequency > 1) {
      candidates = candidates.filter(word => word.freq >= minFrequency);
    }

    // Filter by category
    if (category) {
      candidates = candidates.filter(word => word.category === category);
    }

    return candidates;
  }

  /**
   * Get fuzzy search statistics
   */
  public getStats(): {
    cacheSize: number;
    lastUpdate: Date;
    maxWordsForFuzzy: number;
    cacheTTL: number;
  } {
    return {
      cacheSize: this.frequentWords.length,
      lastUpdate: new Date(this.lastCacheUpdate),
      maxWordsForFuzzy: this.MAX_WORDS_FOR_FUZZY,
      cacheTTL: this.CACHE_TTL,
    };
  }

  /**
   * Force cache refresh (useful for testing or after bulk updates)
   */
  public refreshCache(): void {
    this.updateFrequentWordsCache();
  }
}
