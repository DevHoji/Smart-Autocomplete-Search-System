/**
 

 * Uses Levenshtein distance algorithm for finding similar words.
 * 
 
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
  maxDistance?: number;     
  maxResults?: number;       
  minFrequency?: number;    
  category?: string;         
  preferShorterWords?: boolean; 
}


export class FuzzyService {
  private static instance: FuzzyService;
  private trieService?: TrieService;
  private frequentWords: TrieSuggestion[] = [];
  private lastCacheUpdate: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; 
  private readonly MAX_WORDS_FOR_FUZZY = 5000; 

  private constructor() {
  }

  public static getInstance(): FuzzyService {
    if (!FuzzyService.instance) {
      FuzzyService.instance = new FuzzyService();
    }
    return FuzzyService.instance;
  }

  
  public initialize(trieService: TrieService): void {
    this.trieService = trieService;
    this.updateFrequentWordsCache();
  }

  /**
   
   * 
   * @param query 
   * @param options 
   * @returns 
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
    
    this.updateCacheIfNeeded();

    const candidates = this.getCandidateWords(minFrequency, category);

    const matches: FuzzyMatch[] = [];

    for (const candidate of candidates) {
      const distance = levenshtein.get(normalizedQuery, candidate.word);
      
      if (distance <= maxDistance) {
        matches.push({
          word: candidate.word,
          freq: candidate.freq,
          distance,
          category: candidate.category || '',
          synonyms: candidate.synonyms || [],
          metadata: candidate.metadata || {},
        });
      }
    }

    matches.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      
      if (a.freq !== b.freq) {
        return b.freq - a.freq;
      }
      
      if (preferShorterWords) {
        return a.word.length - b.word.length;
      }
      
      return 0;
    });

    return matches.slice(0, maxResults);
  }

  /**
   
   * 
   * @param query 
   * @param exactMatches 
   * @returns 
   */
  public shouldUseFuzzySearch(query: string, exactMatches: number): boolean {
    
    
    if (exactMatches > 0) {
      return false;
    }

    if (query.length < 3) {
      return false; 
    }

    return true;
  }

  /**
   
   *
   * @param query 
   * @param maxResults 
   * @param category 
   * @returns 
   */
  public async getHybridSuggestions(
    query: string,
    maxResults: number = 10,
    category?: string
  ): Promise<{ suggestions: TrieSuggestion[]; fuzzy: boolean }> {
    if (!this.trieService) {
      throw new Error('FuzzyService not initialized with TrieService');
    }

    const exactSuggestions = this.trieService.getDirectSuggestions(query, maxResults, category);

    if (exactSuggestions.length >= maxResults || !this.shouldUseFuzzySearch(query, exactSuggestions.length)) {
      return {
        suggestions: exactSuggestions,
        fuzzy: false,
      };
    }

    const remainingSlots = maxResults - exactSuggestions.length;
    const fuzzyMatches = await this.fuzzySearch(query, {
      maxResults: remainingSlots,
      category: category || '',
      maxDistance: 2,
    });

    const fuzzySuggestions: TrieSuggestion[] = fuzzyMatches.map(match => ({
      word: match.word,
      freq: match.freq,
      category: match.category,
      synonyms: match.synonyms,
      metadata: match.metadata,
    }));

    const combinedSuggestions = [...exactSuggestions, ...fuzzySuggestions];

    return {
      suggestions: combinedSuggestions,
      fuzzy: fuzzyMatches.length > 0,
    };
  }

  
  private updateFrequentWordsCache(): void {
    if (!this.trieService) {
      console.log('TrieService not available, skipping cache update');
      return;
    }

    try {
      const allWords = this.trieService.getAllWords();

      this.frequentWords = allWords.slice(0, this.MAX_WORDS_FOR_FUZZY);
      this.lastCacheUpdate = Date.now();

      console.log(`Fuzzy search cache updated with ${this.frequentWords.length} words`);
    } catch (error) {
      console.error('Error updating fuzzy search cache:', error);
    }
  }

  
  private updateCacheIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastCacheUpdate > this.CACHE_TTL) {
      this.updateFrequentWordsCache();
    }
  }

 
  private getCandidateWords(minFrequency: number, category?: string): TrieSuggestion[] {
    let candidates = this.frequentWords;

    if (minFrequency > 1) {
      candidates = candidates.filter(word => word.freq >= minFrequency);
    }

    if (category) {
      candidates = candidates.filter(word => word.category === category);
    }

    return candidates;
  }

 
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

  public refreshCache(): void {
    this.updateFrequentWordsCache();
  }
}
