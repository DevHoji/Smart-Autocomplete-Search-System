/**
 * Advanced autocomplete hook with sentence-level support and caret tracking
 * Handles both single-word and multi-word sentence autocomplete
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { contextAnalysisService } from '../services/contextAnalysis';
import type { Suggestion } from '../types';

interface AdvancedAutocompleteState {
  query: string;
  suggestions: Suggestion[];
  selectedIndex: number;
  isLoading: boolean;
  isOpen: boolean;
  error?: string;
  currentWord: string;
  wordStart: number;
  wordEnd: number;
  caretPosition: number;
  sentenceContext: string;
}

interface UseAdvancedAutocompleteOptions {
  debounceMs?: number;
  maxSuggestions?: number;
  category?: string;
  enableSentenceMode?: boolean;
  enableContextPrediction?: boolean;
  onSelect?: (suggestion: Suggestion, wordStart: number, wordEnd: number) => void;
  onSearch?: (query: string) => void;
  onError?: (error: string) => void;
}

interface UseAdvancedAutocompleteReturn {
  state: AdvancedAutocompleteState;
  actions: {
    setQuery: (query: string) => void;
    updateCaretPosition: (position: number, text: string) => void;
    selectSuggestion: (index: number) => void;
    nextSuggestion: () => void;
    previousSuggestion: () => void;
    clearSuggestions: () => void;
  };
}

export function useAdvancedAutocomplete(
  options: UseAdvancedAutocompleteOptions = {}
): UseAdvancedAutocompleteReturn {
  const {
    debounceMs = 150,
    maxSuggestions = 10,
    category,
    enableSentenceMode = true,
    enableContextPrediction = false,
    onSelect,
    onSearch,
    onError,
  } = options;

  const [state, setState] = useState<AdvancedAutocompleteState>({
    query: '',
    suggestions: [],
    selectedIndex: -1,
    isLoading: false,
    isOpen: false,
    error: undefined,
    currentWord: '',
    wordStart: 0,
    wordEnd: 0,
    caretPosition: 0,
    sentenceContext: '',
  });

  const debounceTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Extract current word and context from text and caret position
  const analyzeTextAtCaret = useCallback((text: string, caretPos: number) => {
    if (!enableSentenceMode) {
      // Single-word mode - treat entire text as one word
      return {
        currentWord: text.trim(),
        wordStart: 0,
        wordEnd: text.length,
        sentenceContext: '',
      };
    }

    // Find word boundaries around caret position
    let wordStart = caretPos;
    let wordEnd = caretPos;

    // Find start of current word
    while (wordStart > 0 && /\w/.test(text[wordStart - 1])) {
      wordStart--;
    }

    // Find end of current word
    while (wordEnd < text.length && /\w/.test(text[wordEnd])) {
      wordEnd++;
    }

    const currentWord = text.slice(wordStart, wordEnd);
    
    // Extract sentence context (words before current word)
    const beforeCaret = text.slice(0, wordStart).trim();
    const sentenceContext = beforeCaret;

    return {
      currentWord,
      wordStart,
      wordEnd,
      sentenceContext,
    };
  }, [enableSentenceMode]);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string, currentWord: string, context: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Determine search term
      const searchTerm = enableSentenceMode ? currentWord : query;

      // If search term is empty, clear suggestions
      if (!searchTerm.trim()) {
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

          let suggestions: Suggestion[] = [];

          // Get prefix-based suggestions from Trie
          const trieResponse = await apiService.getSuggestions(
            searchTerm.trim(),
            maxSuggestions,
            category
          );

          suggestions = trieResponse.suggestions;

          // If context prediction is enabled and we have context, enhance suggestions
          if (enableContextPrediction && context.trim()) {
            try {
              // Use local context analysis for better predictions
              const contextualSuggestions = contextAnalysisService.getContextualSuggestions(
                context.trim(),
                searchTerm.trim(),
                suggestions.map(s => s.word)
              );

              // Re-order suggestions based on context
              const reorderedSuggestions = contextualSuggestions.map(word => {
                const existing = suggestions.find(s => s.word === word);
                return existing || {
                  word,
                  freq: 1,
                  category: 'contextual',
                  synonyms: [],
                };
              });

              suggestions = reorderedSuggestions.slice(0, maxSuggestions);

              // Try to get additional contextual suggestions from backend
              try {
                const contextResponse = await apiService.getContextualSuggestions(
                  context.trim(),
                  searchTerm.trim(),
                  Math.floor(maxSuggestions / 3)
                );

                // Merge backend contextual suggestions
                const backendSuggestions = contextResponse.suggestions.filter(
                  cs => !suggestions.some(s => s.word === cs.word)
                );

                suggestions = [
                  ...suggestions.slice(0, Math.floor(maxSuggestions * 2 / 3)),
                  ...backendSuggestions.slice(0, Math.floor(maxSuggestions / 3))
                ];
              } catch (backendError) {
                // Backend context prediction failed, continue with local analysis
                console.warn('Backend context prediction failed:', backendError);
              }
            } catch (contextError) {
              // Context prediction failed, continue with Trie suggestions only
              console.warn('Context prediction failed:', contextError);
            }
          }

          // Check if request was aborted
          if (abortControllerRef.current.signal.aborted) {
            return;
          }

          setState(prev => ({
            ...prev,
            suggestions,
            isLoading: false,
            isOpen: suggestions.length > 0,
            selectedIndex: -1,
            error: undefined,
          }));

          // Call onSearch callback
          if (onSearch) {
            onSearch(enableSentenceMode ? currentWord : query);
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
    [debounceMs, maxSuggestions, category, enableSentenceMode, enableContextPrediction, onSearch, onError]
  );

  // Set query and trigger search
  const setQuery = useCallback((query: string) => {
    setState(prev => {
      const analysis = analyzeTextAtCaret(query, prev.caretPosition);
      
      const newState = {
        ...prev,
        query,
        currentWord: analysis.currentWord,
        wordStart: analysis.wordStart,
        wordEnd: analysis.wordEnd,
        sentenceContext: analysis.sentenceContext,
      };

      // Trigger search with new analysis
      debouncedSearch(query, analysis.currentWord, analysis.sentenceContext);

      return newState;
    });
  }, [analyzeTextAtCaret, debouncedSearch]);

  // Update caret position and re-analyze text
  const updateCaretPosition = useCallback((position: number, text: string) => {
    setState(prev => {
      const analysis = analyzeTextAtCaret(text, position);
      
      const newState = {
        ...prev,
        caretPosition: position,
        currentWord: analysis.currentWord,
        wordStart: analysis.wordStart,
        wordEnd: analysis.wordEnd,
        sentenceContext: analysis.sentenceContext,
      };

      // Only trigger search if current word changed
      if (analysis.currentWord !== prev.currentWord) {
        debouncedSearch(text, analysis.currentWord, analysis.sentenceContext);
      }

      return newState;
    });
  }, [analyzeTextAtCaret, debouncedSearch]);

  // Select suggestion by index
  const selectSuggestion = useCallback(async (index: number) => {
    const suggestion = state.suggestions[index];
    if (!suggestion) return;

    try {
      // Record the selection
      await apiService.selectSuggestion({
        word: suggestion.word,
        prefix: state.currentWord || state.query,
      });

      // Replace current word with selected suggestion
      let newQuery: string;
      
      if (enableSentenceMode && state.currentWord) {
        // Replace only the current word in sentence mode
        newQuery = 
          state.query.slice(0, state.wordStart) + 
          suggestion.word + 
          state.query.slice(state.wordEnd);
      } else {
        // Replace entire query in single-word mode
        newQuery = suggestion.word;
      }

      // Update state
      setState(prev => ({
        ...prev,
        query: newQuery,
        isOpen: false,
        selectedIndex: -1,
        suggestions: [],
      }));

      // Call onSelect callback
      if (onSelect) {
        onSelect(suggestion, state.wordStart, state.wordEnd);
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
  }, [state.suggestions, state.query, state.currentWord, state.wordStart, state.wordEnd, enableSentenceMode, onSelect, onError]);

  // Navigate to next suggestion
  const nextSuggestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex < prev.suggestions.length - 1 
        ? prev.selectedIndex + 1 
        : 0,
    }));
  }, []);

  // Navigate to previous suggestion
  const previousSuggestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex > 0 
        ? prev.selectedIndex - 1 
        : prev.suggestions.length - 1,
    }));
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      suggestions: [],
      isOpen: false,
      selectedIndex: -1,
      error: undefined,
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
      setQuery,
      updateCaretPosition,
      selectSuggestion,
      nextSuggestion,
      previousSuggestion,
      clearSuggestions,
    },
  };
}
