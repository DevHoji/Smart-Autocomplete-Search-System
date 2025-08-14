/**
 * Custom hook for autocomplete functionality
 * Handles debounced search, suggestion management, and keyboard navigation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import type { Suggestion, AutocompleteState, UseAutocompleteReturn } from '../types';

interface UseAutocompleteOptions {
  debounceMs?: number;
  maxSuggestions?: number;
  category?: string;
  onSelect?: (suggestion: Suggestion) => void;
  onSearch?: (query: string) => void;
  onError?: (error: string) => void;
}

export function useAutocomplete(options: UseAutocompleteOptions = {}): UseAutocompleteReturn {
  const {
    debounceMs = 150,
    maxSuggestions = 10,
    category,
    onSelect,
    onSearch,
    onError,
  } = options;

  const [state, setState] = useState<AutocompleteState>({
    query: '',
    suggestions: [],
    selectedIndex: -1,
    isLoading: false,
    isOpen: false,
    error: undefined,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Detect if text contains Amharic characters
  const isAmharicText = useCallback((text: string): boolean => {
    // Amharic Unicode range: U+1200-U+137F
    const amharicRegex = /[\u1200-\u137F]/;
    return amharicRegex.test(text);
  }, []);

  // Extract current word being typed from cursor position
  const getCurrentWord = useCallback((text: string, cursorPosition?: number): { word: string; startIndex: number; endIndex: number; isAmharic: boolean } => {
    if (!text.trim()) {
      return { word: '', startIndex: 0, endIndex: 0, isAmharic: false };
    }

    // If no cursor position provided, use end of text
    const pos = cursorPosition ?? text.length;

    // Find word boundaries around cursor position
    let startIndex = pos;
    let endIndex = pos;

    // Move backwards to find start of current word
    while (startIndex > 0 && /\S/.test(text[startIndex - 1])) {
      startIndex--;
    }

    // Move forwards to find end of current word
    while (endIndex < text.length && /\S/.test(text[endIndex])) {
      endIndex++;
    }

    const word = text.slice(startIndex, endIndex).trim();
    const isAmharic = isAmharicText(word);

    return { word, startIndex, endIndex, isAmharic };
  }, [isAmharicText]);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string, cursorPosition?: number) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Extract current word being typed
      const { word: currentWord, isAmharic } = getCurrentWord(query, cursorPosition);

      // If current word is empty or too short, clear suggestions
      if (!currentWord || currentWord.length < 1) {
        setState(prev => ({
          ...prev,
          suggestions: [],
          isOpen: false,
          isLoading: false,
          error: undefined,
        }));
        return;
      }

      // Determine category based on language
      const searchCategory = isAmharic ? 'amharic' : category;

      // Set loading state
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: undefined,
      }));

      // Debounce the search
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          // Create new abort controller for this request
          abortControllerRef.current = new AbortController();

          // Search using only the current word with language-specific category
          const response = await apiService.getSuggestions(
            currentWord,
            maxSuggestions,
            searchCategory
          );

          // Check if request was aborted
          if (abortControllerRef.current.signal.aborted) {
            return;
          }

          setState(prev => ({
            ...prev,
            suggestions: response.suggestions,
            isLoading: false,
            isOpen: response.suggestions.length > 0,
            selectedIndex: -1,
            error: undefined,
          }));

          // Call onSearch callback
          if (onSearch) {
            onSearch(query);
          }

        } catch (error: unknown) {
          // Don't update state if request was aborted
          if ((error as Error)?.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
            return;
          }

          const errorMessage = (error as Error)?.message || 'Failed to fetch suggestions';
          
          setState(prev => ({
            ...prev,
            suggestions: [],
            isLoading: false,
            isOpen: false,
            error: errorMessage,
          }));

          if (onError) {
            onError(errorMessage);
          }
        }
      }, debounceMs);
    },
    [debounceMs, maxSuggestions, category, onSearch, onError, getCurrentWord]
  );

  // Set query and trigger search
  const setQuery = useCallback((query: string, cursorPosition?: number) => {
    setState(prev => ({
      ...prev,
      query,
    }));

    debouncedSearch(query, cursorPosition);
  }, [debouncedSearch]);

  // Select suggestion by index
  const selectSuggestion = useCallback(async (index: number, cursorPosition?: number) => {
    const suggestion = state.suggestions[index];
    if (!suggestion) return;

    try {
      // Get current word info
      const { word: currentWord, startIndex, endIndex } = getCurrentWord(state.query, cursorPosition);

      // Record the selection
      await apiService.selectSuggestion({
        word: suggestion.word,
        prefix: currentWord,
      });

      // Replace only the current word with the selected suggestion
      const newQuery = state.query.slice(0, startIndex) + suggestion.word + state.query.slice(endIndex);

      // Update state
      setState(prev => ({
        ...prev,
        query: newQuery,
        isOpen: false,
        selectedIndex: -1,
      }));

      // Call onSelect callback with the new complete query
      if (onSelect) {
        onSelect({
          ...suggestion,
          word: newQuery, // Pass the complete text
        });
      }

    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Failed to record selection';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [state.suggestions, state.query, onSelect, onError, getCurrentWord]);

  // Clear suggestions and close dropdown
  const clearSuggestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      suggestions: [],
      isOpen: false,
      selectedIndex: -1,
      error: undefined,
    }));
  }, []);

  // Navigate to next suggestion
  const nextSuggestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex < prev.suggestions.length - 1 
        ? prev.selectedIndex + 1 
        : prev.selectedIndex,
    }));
  }, []);

  // Navigate to previous suggestion
  const previousSuggestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex > -1 
        ? prev.selectedIndex - 1 
        : -1,
    }));
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
    state,
    actions: {
      search: setQuery, // Alias for backward compatibility
      setQuery,
      selectSuggestion,
      clearSuggestions,
      nextSuggestion,
      previousSuggestion,
    },
  };
}
