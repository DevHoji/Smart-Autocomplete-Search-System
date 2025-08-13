/**
 * Multi-Mode Autocomplete Component
 * Supports both single-letter suggestions and sentence-level autocomplete with spell checking
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Mic, Volume2, VolumeX, X, Image } from 'lucide-react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useSpellChecker } from '../hooks/useSpellChecker';
import { useSettings } from '../contexts/SettingsContext';
import SuggestionItem from './SuggestionItem';
import SpellCheckContextMenu from './SpellCheckContextMenu';
import VoiceInput from './VoiceInput';
import ImageOCRModal from './ImageOCRModal';
import type { Suggestion } from '../types/index';

interface MultiModeAutocompleteProps {
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

const MultiModeAutocomplete: React.FC<MultiModeAutocompleteProps> = ({
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
  const [currentWord, setCurrentWord] = useState('');
  const [currentWordStart, setCurrentWordStart] = useState(0);
  const [currentWordEnd, setCurrentWordEnd] = useState(0);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedMisspelledWord, setSelectedMisspelledWord] = useState<string | null>(null);

  const { settings } = useSettings();

  // Get current word at cursor position
  const getCurrentWordAtCursor = useCallback((text: string, cursorPos: number) => {
    if (!text || cursorPos < 0) return { word: '', start: 0, end: 0 };

    // Find word boundaries
    let start = cursorPos;
    let end = cursorPos;

    // Move start backward to find word beginning
    while (start > 0 && /\w/.test(text[start - 1])) {
      start--;
    }

    // Move end forward to find word ending
    while (end < text.length && /\w/.test(text[end])) {
      end++;
    }

    const word = text.slice(start, end);
    return { word, start, end };
  }, []);

  // Autocomplete hook for suggestions
  const { state, actions } = useAutocomplete({
    maxSuggestions,
    category,
    onSelect: (suggestion: Suggestion) => {
      if (enableSentenceMode && inputRef.current) {
        // Replace current word with suggestion
        const input = inputRef.current;
        const text = input.value;
        const newText = text.slice(0, currentWordStart) + suggestion.word + text.slice(currentWordEnd);
        
        input.value = newText;
        const newCursorPos = currentWordStart + suggestion.word.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        
        // Update current word info
        const wordInfo = getCurrentWordAtCursor(newText, newCursorPos);
        setCurrentWord(wordInfo.word);
        setCurrentWordStart(wordInfo.start);
        setCurrentWordEnd(wordInfo.end);
      }

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

  // Voice input hook
  const voiceInput = useVoiceInput({
    onResult: (transcript: string) => {
      if (inputRef.current) {
        inputRef.current.value = transcript;
        handleInputChange({ target: { value: transcript } } as any);
        setVoiceInputUsed(true);
      }
    },
    onError: (error: string) => {
      console.error('Voice input error:', error);
    },
  });

  // Text-to-Speech for suggestions
  const tts = useTextToSpeech({
    rate: settings.voiceSpeed,
    pitch: 1.0, // Default pitch since it's not in settings
    volume: settings.volume / 100, // Convert percentage to 0-1 range
  });

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    if (enableSentenceMode) {
      // Get current word at cursor
      const wordInfo = getCurrentWordAtCursor(value, cursorPos);
      setCurrentWord(wordInfo.word);
      setCurrentWordStart(wordInfo.start);
      setCurrentWordEnd(wordInfo.end);

      // Search for suggestions for current word
      if (wordInfo.word.length > 0) {
        actions.search(wordInfo.word);
      } else {
        actions.clearSuggestions();
      }
    } else {
      // Single-letter mode: search for entire input
      if (value.length > 0) {
        actions.search(value);
      } else {
        actions.clearSuggestions();
      }
    }

    // Check spelling if enabled
    if (enableSpellCheck) {
      checkText(value);
    }

    setVoiceInputUsed(false);
  }, [enableSentenceMode, enableSpellCheck, actions, checkText, getCurrentWordAtCursor]);

  // Handle cursor position changes
  const handleCursorChange = useCallback(() => {
    if (!enableSentenceMode || !inputRef.current) return;

    const cursorPos = inputRef.current.selectionStart || 0;
    const value = inputRef.current.value;
    const wordInfo = getCurrentWordAtCursor(value, cursorPos);
    
    setCurrentWord(wordInfo.word);
    setCurrentWordStart(wordInfo.start);
    setCurrentWordEnd(wordInfo.end);

    // Update suggestions for current word
    if (wordInfo.word.length > 0) {
      actions.search(wordInfo.word);
    } else {
      actions.clearSuggestions();
    }
  }, [enableSentenceMode, actions, getCurrentWordAtCursor]);

  // Handle right-click for spell check
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!enableSpellCheck) return;

    e.preventDefault();
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if clicked on a misspelled word
    const cursorPos = inputRef.current?.selectionStart || 0;
    const value = inputRef.current?.value || '';
    const wordInfo = getCurrentWordAtCursor(value, cursorPos);

    const misspelledWord = misspelledWords.find(mw => mw.word === wordInfo.word);
    if (misspelledWord) {
      setSelectedMisspelledWord(wordInfo.word);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
    }
  }, [enableSpellCheck, misspelledWords, getCurrentWordAtCursor]);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    actions.selectSuggestion(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (state.isOpen && state.suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          actions.navigateDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          actions.navigateUp();
          break;
        case 'Enter':
          e.preventDefault();
          if (state.selectedIndex >= 0) {
            handleSuggestionSelect(state.suggestions[state.selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          actions.clearSuggestions();
          setIsFocused(false);
          break;
      }
    }
  };

  // Handle spell correction selection
  const handleSpellCorrection = (correction: string) => {
    if (!inputRef.current || !selectedMisspelledWord) return;

    const value = inputRef.current.value;
    const correctedValue = value.replace(selectedMisspelledWord, correction);
    inputRef.current.value = correctedValue;
    
    handleInputChange({ target: { value: correctedValue } } as any);
    setContextMenuPosition(null);
    setSelectedMisspelledWord(null);
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenuPosition(null);
    setSelectedMisspelledWord(null);
  };

  // Clear input
  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      handleInputChange({ target: { value: '' } } as any);
      inputRef.current.focus();
    }
  };

  // Show dropdown condition
  const showDropdown = isFocused && state.isOpen && state.suggestions.length > 0;

  // Render misspelled words with red underlines
  const renderTextWithSpellCheck = () => {
    if (!enableSpellCheck || !inputRef.current) return null;

    const value = inputRef.current.value;
    const words = value.split(/(\s+)/);
    
    return (
      <div className="absolute inset-0 pointer-events-none text-transparent whitespace-pre-wrap break-words">
        {words.map((word, index) => {
          const trimmedWord = word.trim();
          const isMisspelled = misspelledWords.some(mw => mw.word === trimmedWord);
          return (
            <span
              key={index}
              className={isMisspelled ? 'border-b-2 border-red-500' : ''}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Container */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="w-full pl-12 pr-32 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            onSelect={handleCursorChange}
            onClick={handleCursorChange}
            onContextMenu={handleContextMenu}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Spell check overlay */}
          {enableSpellCheck && renderTextWithSpellCheck()}

          {/* Action Buttons */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Voice Input */}
            <VoiceInput
              onResult={(transcript) => {
                if (inputRef.current) {
                  inputRef.current.value = transcript;
                  handleInputChange({ target: { value: transcript } } as any);
                  setVoiceInputUsed(true);
                }
              }}
              onError={(error) => console.error('Voice input error:', error)}
            />

            {/* TTS Toggle */}
            <button
              onClick={() => tts.actions.toggle()}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700"
              title={tts.state.isEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
            >
              {tts.state.isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Image OCR */}
            <button
              onClick={() => setIsImageOCROpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700"
              title="Extract text from image"
            >
              <Image className="w-4 h-4" />
            </button>

            {/* Clear Button */}
            {inputRef.current?.value && (
              <button
                onClick={clearInput}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mt-2 text-red-400 text-sm">
            {state.error}
          </div>
        )}
      </div>

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
              highlightQuery={enableSentenceMode ? currentWord : state.query}
            />
          ))}
        </div>
      )}

      {/* Spell Check Context Menu */}
      {contextMenuPosition && selectedMisspelledWord && (
        <SpellCheckContextMenu
          word={selectedMisspelledWord}
          position={contextMenuPosition}
          onSelect={handleSpellCorrection}
          onClose={closeContextMenu}
          getSuggestions={getSpellSuggestions}
        />
      )}

      {/* Image OCR Modal */}
      {isImageOCROpen && (
        <ImageOCRModal
          isOpen={isImageOCROpen}
          onClose={() => setIsImageOCROpen(false)}
          onTextExtracted={(text) => {
            if (inputRef.current) {
              inputRef.current.value = text;
              handleInputChange({ target: { value: text } } as any);
            }
          }}
        />
      )}
    </div>
  );
};

export default MultiModeAutocomplete;
