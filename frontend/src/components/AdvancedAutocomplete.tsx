/**
 * AdvancedAutocomplete component
 * Multi-mode autocomplete with sentence-level suggestions, spell checking, and caret tracking
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Search, Loader2, AlertCircle, X, Image, Mic } from 'lucide-react';
import { useAdvancedAutocomplete } from '../hooks/useAdvancedAutocomplete';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useSpellChecker } from '../hooks/useSpellChecker';
import SuggestionItem from './SuggestionItem';
import VoiceInput from './VoiceInput';
import ImageOCRModal from './ImageOCRModal';
import SpellCheckContextMenu from './SpellCheckContextMenu';
import type { Suggestion } from '../types/index';

interface AdvancedAutocompleteProps {
  placeholder?: string;
  maxSuggestions?: number;
  category?: string;
  onSelect?: (suggestion: Suggestion) => void;
  onSearch?: (query: string) => void;
  className?: string;
  enableSpellCheck?: boolean;
  enableSentenceMode?: boolean;
  enableContextPrediction?: boolean;
}

const AdvancedAutocomplete: React.FC<AdvancedAutocompleteProps> = ({
  placeholder = 'Start typing to search...',
  maxSuggestions = 10,
  category,
  onSelect,
  onSearch,
  className = '',
  enableSpellCheck = true,
  enableSentenceMode = true,
  enableContextPrediction = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [voiceInputUsed, setVoiceInputUsed] = useState(false);
  const [isImageOCROpen, setIsImageOCROpen] = useState(false);
  const [caretPosition, setCaretPosition] = useState(0);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedMisspelledWord, setSelectedMisspelledWord] = useState<string | null>(null);

  // Advanced autocomplete hook with sentence support
  const { state, actions } = useAdvancedAutocomplete({
    maxSuggestions,
    category,
    enableSentenceMode,
    enableContextPrediction,
    onSelect: (suggestion: Suggestion, wordStart: number, wordEnd: number) => {
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

  // Spell checker hook
  const { 
    misspelledWords, 
    getSuggestions: getSpellSuggestions,
    checkText 
  } = useSpellChecker({
    enabled: enableSpellCheck,
  });

  // Text-to-Speech for suggestions
  const tts = useTextToSpeech({
    rate: 1.1,
    pitch: 1,
    volume: 0.8,
  });

  // Track caret position for sentence-level autocomplete
  const updateCaretPosition = useCallback(() => {
    if (inputRef.current) {
      const position = inputRef.current.selectionStart || 0;
      setCaretPosition(position);
      
      if (enableSentenceMode) {
        actions.updateCaretPosition(position, state.query);
      }
    }
  }, [state.query, enableSentenceMode, actions]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Update caret position on arrow keys
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      setTimeout(updateCaretPosition, 0);
    }

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
    const newValue = event.target.value;
    actions.setQuery(newValue);
    
    // Check spelling if enabled
    if (enableSpellCheck) {
      checkText(newValue);
    }
    
    // Update caret position
    setTimeout(updateCaretPosition, 0);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
    updateCaretPosition();
    
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
    setIsFocused(false);
    const index = state.suggestions.findIndex(s => s.word === suggestion.word);
    if (index >= 0) {
      actions.selectSuggestion(index);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Handle right-click for spell checking
  const handleContextMenu = (event: React.MouseEvent<HTMLInputElement>) => {
    if (!enableSpellCheck) return;

    event.preventDefault();
    
    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    
    // Find which word was clicked
    const text = input.value;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    context.font = getComputedStyle(input).font;
    
    let charPosition = 0;
    let currentWidth = 0;
    
    for (let i = 0; i < text.length; i++) {
      const charWidth = context.measureText(text[i]).width;
      if (currentWidth + charWidth / 2 > clickX) {
        charPosition = i;
        break;
      }
      currentWidth += charWidth;
      charPosition = i + 1;
    }

    // Find word boundaries
    const words = text.split(/\s+/);
    let wordStart = 0;
    let wordEnd = 0;
    let currentPos = 0;
    
    for (const word of words) {
      wordStart = currentPos;
      wordEnd = currentPos + word.length;
      
      if (charPosition >= wordStart && charPosition <= wordEnd) {
        // Check if this word is misspelled
        if (misspelledWords.some(mw => mw.word === word && mw.start === wordStart)) {
          setSelectedMisspelledWord(word);
          setContextMenuPosition({ x: event.clientX, y: event.clientY });
        }
        break;
      }
      
      currentPos = wordEnd + 1; // +1 for space
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

    if (tts.state.isEnabled) {
      tts.actions.speak(`Searching for: ${transcript}`);
    }
  };

  // Handle OCR text extraction
  const handleOCRText = (extractedText: string) => {
    actions.setQuery(extractedText);
    
    // Check spelling for OCR text
    if (enableSpellCheck) {
      checkText(extractedText);
    }
    
    inputRef.current?.focus();
    setIsImageOCROpen(false);
  };

  // Handle spell correction selection
  const handleSpellCorrection = (originalWord: string, correctedWord: string) => {
    const currentText = state.query;
    const newText = currentText.replace(new RegExp(`\\b${originalWord}\\b`, 'g'), correctedWord);
    actions.setQuery(newText);
    setContextMenuPosition(null);
    setSelectedMisspelledWord(null);
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPosition(null);
      setSelectedMisspelledWord(null);
    };

    if (contextMenuPosition) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenuPosition]);

  // Speak suggestions when voice input was used
  useEffect(() => {
    if (voiceInputUsed && state.suggestions.length > 0 && !state.isLoading && tts.state.isEnabled) {
      const topSuggestions = state.suggestions.slice(0, 3).map(s => s.word);

      if (topSuggestions.length === 1) {
        tts.actions.speak(`Found: ${topSuggestions[0]}`);
      } else {
        tts.actions.speak(`Top suggestions: ${topSuggestions.join(', ')}`);
      }

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
          onContextMenu={handleContextMenu}
          onSelect={updateCaretPosition}
          onClick={updateCaretPosition}
          placeholder={placeholder}
          className={`input-field text-lg pl-12 pr-24 ${state.error ? 'border-red-500 focus:border-red-500' : ''} ${
            enableSpellCheck ? 'spell-check-enabled' : ''
          }`}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
          spellCheck={false} // We handle spell checking manually
        />

        {/* Action Buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {/* Voice Input */}
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            onError={(error) => console.error('Voice input error:', error)}
            className="flex-shrink-0"
          />

          {/* Image OCR */}
          <button
            onClick={() => setIsImageOCROpen(true)}
            className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
            title="Extract text from image"
          >
            <Image className="w-5 h-5" />
          </button>

          {/* Clear Button */}
          {state.query && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Loading Indicator */}
          {state.isLoading && (
            <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
          )}

          {/* Error Indicator */}
          {state.error && (
            <AlertCircle className="w-4 h-4 text-red-400" title={state.error} />
          )}
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="mt-2 text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-2">
          {state.error}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 card max-h-96 overflow-y-auto border-glow"
          role="listbox"
        >
          {state.suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={`${suggestion.word}-${index}`}
              suggestion={suggestion}
              isSelected={index === state.selectedIndex}
              onSelect={handleSuggestionSelect}
              highlightQuery={state.currentWord || state.query}
            />
          ))}
        </div>
      )}

      {/* Spell Check Context Menu */}
      {contextMenuPosition && selectedMisspelledWord && (
        <SpellCheckContextMenu
          word={selectedMisspelledWord}
          position={contextMenuPosition}
          suggestions={getSpellSuggestions(selectedMisspelledWord)}
          onSelect={handleSpellCorrection}
          onClose={() => {
            setContextMenuPosition(null);
            setSelectedMisspelledWord(null);
          }}
        />
      )}

      {/* Image OCR Modal */}
      <ImageOCRModal
        isOpen={isImageOCROpen}
        onClose={() => setIsImageOCROpen(false)}
        onTextExtracted={handleOCRText}
      />
    </div>
  );
};

export default AdvancedAutocomplete;
