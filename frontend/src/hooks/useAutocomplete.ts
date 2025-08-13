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

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // If query is empty, clear suggestions
      if (!query.trim()) {
        setState(prev => ({
          ...prev,
          suggestions: [],
          isOpen: false,
          isLoading: false,
          error: undefined,
        }));
        return;
      }

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

          const response = await apiService.getSuggestions(
            query.trim(),
            maxSuggestions,
            category
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
    [debounceMs, maxSuggestions, category, onSearch, onError]
  );

  // Set query and trigger search
  const setQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      query,
    }));

    debouncedSearch(query);
  }, [debouncedSearch]);

  // Select suggestion by index
  const selectSuggestion = useCallback(async (index: number) => {
    const suggestion = state.suggestions[index];
    if (!suggestion) return;

    try {
      // Record the selection
      await apiService.selectSuggestion({
        word: suggestion.word,
        prefix: state.query,
      });

      // Update state
      setState(prev => ({
        ...prev,
        query: suggestion.word,
        isOpen: false,
        selectedIndex: -1,
      }));

      // Call onSelect callback
      if (onSelect) {
        onSelect(suggestion);
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
  }, [state.suggestions, state.query, onSelect, onError]);

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
