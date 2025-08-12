/**
 * Autocomplete component
 * Main search interface with debounced input, dropdown suggestions, and keyboard navigation
 */

import React, { useRef, useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle, X, Image } from 'lucide-react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import SuggestionItem from './SuggestionItem';
import VoiceInput from './VoiceInput';
import ImageOCRModal from './ImageOCRModal';
import { AutocompleteProps, Suggestion } from '../types/index';

const Autocomplete: React.FC<AutocompleteProps> = ({
  placeholder = 'Start typing to search...',
  maxSuggestions = 10,
  category,
  onSelect,
  onSearch,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [voiceInputUsed, setVoiceInputUsed] = useState(false);
  const [isImageOCROpen, setIsImageOCROpen] = useState(false);

  const { state, actions } = useAutocomplete({
    maxSuggestions,
    category,
    onSelect: (suggestion: Suggestion) => {
      setIsFocused(false);

      // Speak the selected suggestion if voice was used or TTS is enabled
      if (voiceInputUsed || tts.state.isEnabled) {
        tts.actions.speak(`Selected: ${suggestion.word}`);
      }

      if (onSelect) {
        onSelect(suggestion);
      }
    },
    onSearch,
  });

  // Text-to-Speech for suggestions
  const tts = useTextToSpeech({
    rate: 1.1,
    pitch: 1,
    volume: 0.8,
  });

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!state.isOpen || state.suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        actions.nextSuggestion();
        break;

      case 'ArrowUp':
        event.preventDefault();
        actions.previousSuggestion();
        break;

      case 'Enter':
        event.preventDefault();
        if (state.selectedIndex >= 0) {
          actions.selectSuggestion(state.selectedIndex);
        }
        break;

      case 'Escape':
        event.preventDefault();
        actions.clearSuggestions();
        inputRef.current?.blur();
        break;

      case 'Tab':
        // Allow tab to close suggestions
        actions.clearSuggestions();
        break;
    }
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    actions.setQuery(event.target.value);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
    // Re-trigger search if there's a query but no suggestions
    if (state.query && state.suggestions.length === 0 && !state.isLoading) {
      actions.setQuery(state.query);
    }
  };

  // Handle input blur (with delay to allow clicking on suggestions)
  const handleInputBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      actions.clearSuggestions();
    }, 150);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const index = state.suggestions.findIndex(s => s.word === suggestion.word);
    if (index >= 0) {
      actions.selectSuggestion(index);
    }
  };

  // Clear input
  const handleClear = () => {
    actions.setQuery('');
    setVoiceInputUsed(false);
    inputRef.current?.focus();
  };

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setVoiceInputUsed(true);
    actions.setQuery(transcript);
    inputRef.current?.focus();

    // Speak confirmation
    if (tts.state.isEnabled) {
      tts.actions.speak(`Searching for: ${transcript}`);
    }
  };

  // Handle voice error
  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error);

    // Optionally speak the error
    if (tts.state.isEnabled) {
      tts.actions.speak('Voice input error occurred');
    }
  };

  // Handle OCR text extraction
  const handleOCRTextExtracted = (text: string) => {
    actions.setQuery(text);
    inputRef.current?.focus();

    // Speak confirmation
    if (tts.state.isEnabled) {
      tts.actions.speak(`Text extracted: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    }
  };

  // Handle OCR error
  const handleOCRError = (error: string) => {
    console.error('OCR error:', error);

    // Optionally speak the error
    if (tts.state.isEnabled) {
      tts.actions.speak('Image text extraction failed');
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (state.selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[state.selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [state.selectedIndex]);

  // Speak suggestions when voice input was used
  useEffect(() => {
    if (voiceInputUsed && state.suggestions.length > 0 && !state.isLoading && tts.state.isEnabled) {
      const topSuggestions = state.suggestions.slice(0, 3).map(s => s.word);

      if (topSuggestions.length === 1) {
        tts.actions.speak(`Found: ${topSuggestions[0]}`);
      } else {
        tts.actions.speak(`Top suggestions: ${topSuggestions.join(', ')}`);
      }

      // Reset voice input flag after speaking
      setTimeout(() => setVoiceInputUsed(false), 1000);
    }
  }, [state.suggestions, state.isLoading, voiceInputUsed, tts.state.isEnabled, tts.actions]);

  // Show dropdown when focused and has suggestions
  const showDropdown = isFocused && state.isOpen && state.suggestions.length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={state.query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-12 py-3 text-lg border border-gray-300 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200 shadow-sm
            ${state.error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {/* Voice Input Component */}
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            onError={handleVoiceError}
          />

          {/* Image OCR Button */}
          <button
            onClick={() => setIsImageOCROpen(true)}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
            aria-label="Extract text from image"
            title="Upload image to extract text"
          >
            <Image className="w-5 h-5" />
          </button>

          {state.isLoading && (
            <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
          )}

          {state.error && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}

          {state.query && !state.isLoading && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {state.error}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto"
          role="listbox"
        >
          {state.suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={`${suggestion.word}-${index}`}
              suggestion={suggestion}
              isSelected={index === state.selectedIndex}
              onSelect={handleSuggestionSelect}
              highlightQuery={state.query}
            />
          ))}
          
          {/* Footer with suggestion count */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 rounded-b-xl">
            {state.suggestions.length} suggestion{state.suggestions.length !== 1 ? 's' : ''} found
            {category && (
              <span className="ml-2">
                • Filtered by: <span className="font-medium capitalize">{category}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading state for empty results */}
      {state.isLoading && state.query && !state.suggestions.length && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
          <Loader2 className="h-6 w-6 text-primary-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Searching for "{state.query}"...</p>
        </div>
      )}

      {/* No results state */}
      {!state.isLoading && state.query && state.suggestions.length === 0 && isFocused && !state.error && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
          <Search className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No suggestions found for "{state.query}"</p>
          <p className="text-xs text-gray-500 mt-1">Try a different search term or check your spelling</p>
        </div>
      )}

      {/* Image OCR Modal */}
      <ImageOCRModal
        isOpen={isImageOCROpen}
        onClose={() => setIsImageOCROpen(false)}
        onTextExtracted={handleOCRTextExtracted}
        onError={handleOCRError}
      />
    </div>
  );
};

export default Autocomplete;
