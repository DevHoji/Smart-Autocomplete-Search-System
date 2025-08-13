/**
 * Spell checker hook with real-time checking and correction suggestions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../services/api';

interface MisspelledWord {
  word: string;
  start: number;
  end: number;
  suggestions: string[];
}

interface UseSpellCheckerOptions {
  enabled?: boolean;
  debounceMs?: number;
  maxSuggestions?: number;
}

interface UseSpellCheckerReturn {
  misspelledWords: MisspelledWord[];
  isChecking: boolean;
  checkText: (text: string) => void;
  getSuggestions: (word: string) => string[];
  addToDictionary: (word: string) => void;
  ignoredWords: Set<string>;
}

export function useSpellChecker(options: UseSpellCheckerOptions = {}): UseSpellCheckerReturn {
  const {
    enabled = true,
    debounceMs = 500,
    maxSuggestions = 5,
  } = options;

  const [misspelledWords, setMisspelledWords] = useState<MisspelledWord[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(new Set());
  
  const debounceTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const suggestionsCacheRef = useRef<Map<string, string[]>>(new Map());

  // Built-in dictionary for common words (fallback)
  const commonWords = useRef<Set<string>>(new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
    'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
    'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
    'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
    'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
    'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
    'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are',
    'been', 'has', 'had', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'if',
    'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like',
    'into', 'him', 'has', 'two', 'more', 'very', 'what', 'know', 'just', 'first', 'get', 'over',
    'think', 'also', 'your', 'work', 'life', 'only', 'can', 'still', 'should', 'after', 'being',
    'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'go', 'me', 'back', 'with',
    'well', 'were', 'been', 'have', 'there', 'could', 'said', 'each', 'which', 'do', 'how', 'their',
    'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
    'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'very', 'what', 'know', 'just'
  ]));

  // Calculate Levenshtein distance for spell suggestions
  const levenshteinDistance = useCallback((str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i - 1] + 1, // substitution
            matrix[j][i - 1] + 1,     // insertion
            matrix[j - 1][i] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }, []);

  // Generate spell suggestions using Levenshtein distance
  const generateSpellSuggestions = useCallback(async (word: string): Promise<string[]> => {
    if (suggestionsCacheRef.current.has(word)) {
      return suggestionsCacheRef.current.get(word) || [];
    }

    try {
      // Try to get suggestions from the backend first
      const response = await apiService.getSpellSuggestions(word, maxSuggestions);
      const suggestions = response.suggestions || [];
      
      suggestionsCacheRef.current.set(word, suggestions);
      return suggestions;
    } catch (error) {
      // Fallback to local suggestions using Levenshtein distance
      console.warn('Backend spell suggestions failed, using local fallback:', error);
      
      const suggestions: Array<{ word: string; distance: number }> = [];
      const maxDistance = Math.min(2, Math.floor(word.length / 3));

      // Check against common words
      for (const commonWord of commonWords.current) {
        if (commonWord.length >= word.length - 2 && commonWord.length <= word.length + 2) {
          const distance = levenshteinDistance(word.toLowerCase(), commonWord.toLowerCase());
          if (distance <= maxDistance) {
            suggestions.push({ word: commonWord, distance });
          }
        }
      }

      // Sort by distance and return top suggestions
      const sortedSuggestions = suggestions
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxSuggestions)
        .map(s => s.word);

      suggestionsCacheRef.current.set(word, sortedSuggestions);
      return sortedSuggestions;
    }
  }, [maxSuggestions, levenshteinDistance]);

  // Check if a word is correctly spelled
  const isWordCorrect = useCallback(async (word: string): Promise<boolean> => {
    // Skip ignored words
    if (ignoredWords.has(word.toLowerCase())) {
      return true;
    }

    // Skip very short words or numbers
    if (word.length <= 1 || /^\d+$/.test(word)) {
      return true;
    }

    // Check common words first
    if (commonWords.current.has(word.toLowerCase())) {
      return true;
    }

    try {
      // Check with backend dictionary
      const response = await apiService.checkSpelling(word);
      return response.isCorrect;
    } catch (error) {
      // Fallback: assume word is correct if we can't check
      console.warn('Spell check failed, assuming word is correct:', error);
      return true;
    }
  }, [ignoredWords]);

  // Check text for misspelled words
  const checkText = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) {
      setMisspelledWords([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsChecking(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        abortControllerRef.current = new AbortController();

        // Extract words with their positions
        const wordRegex = /\b[a-zA-Z]+\b/g;
        const words: Array<{ word: string; start: number; end: number }> = [];
        let match;

        while ((match = wordRegex.exec(text)) !== null) {
          words.push({
            word: match[0],
            start: match.index,
            end: match.index + match[0].length,
          });
        }

        // Check each word
        const misspelled: MisspelledWord[] = [];
        
        for (const { word, start, end } of words) {
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          const isCorrect = await isWordCorrect(word);
          
          if (!isCorrect) {
            const suggestions = await generateSpellSuggestions(word);
            misspelled.push({
              word,
              start,
              end,
              suggestions,
            });
          }
        }

        if (!abortControllerRef.current?.signal.aborted) {
          setMisspelledWords(misspelled);
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          console.error('Spell check error:', error);
          setMisspelledWords([]);
        }
      } finally {
        setIsChecking(false);
      }
    }, debounceMs);
  }, [enabled, debounceMs, isWordCorrect, generateSpellSuggestions]);

  // Get cached suggestions for a word
  const getSuggestions = useCallback((word: string): string[] => {
    return suggestionsCacheRef.current.get(word) || [];
  }, []);

  // Add word to ignored dictionary
  const addToDictionary = useCallback((word: string) => {
    setIgnoredWords(prev => new Set([...prev, word.toLowerCase()]));
    
    // Remove from misspelled words
    setMisspelledWords(prev => 
      prev.filter(mw => mw.word.toLowerCase() !== word.toLowerCase())
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    misspelledWords,
    isChecking,
    checkText,
    getSuggestions,
    addToDictionary,
    ignoredWords,
  };
}
