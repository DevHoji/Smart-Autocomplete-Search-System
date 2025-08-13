/**
 * SpellCheckContextMenu component
 * Context menu for spell check corrections and options
 */

import React, { useEffect, useRef } from 'react';
import { Check, Plus, X } from 'lucide-react';

interface SpellCheckContextMenuProps {
  word: string;
  position: { x: number; y: number };
  suggestions: string[];
  onSelect: (originalWord: string, correctedWord: string) => void;
  onAddToDictionary?: (word: string) => void;
  onIgnore?: (word: string) => void;
  onClose: () => void;
}

const SpellCheckContextMenu: React.FC<SpellCheckContextMenuProps> = ({
  word,
  position,
  suggestions,
  onSelect,
  onAddToDictionary,
  onIgnore,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Position the menu and handle viewport boundaries
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position;

      // Adjust horizontal position if menu would overflow
      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 10;
      }
      if (x < 10) {
        x = 10;
      }

      // Adjust vertical position if menu would overflow
      if (y + rect.height > viewportHeight) {
        y = position.y - rect.height - 10;
      }
      if (y < 10) {
        y = 10;
      }

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [position]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onSelect(word, suggestion);
    onClose();
  };

  // Handle add to dictionary
  const handleAddToDictionary = () => {
    if (onAddToDictionary) {
      onAddToDictionary(word);
    }
    onClose();
  };

  // Handle ignore word
  const handleIgnore = () => {
    if (onIgnore) {
      onIgnore(word);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-2 min-w-48 max-w-64"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">
            Misspelled: <span className="text-red-400 font-mono">{word}</span>
          </span>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="py-1">
          <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Check className="w-4 h-4 text-green-400" />
              <span className="font-mono">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* No suggestions message */}
      {suggestions.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-400 italic">
          No suggestions available
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-600 py-1 mt-1">
        {onAddToDictionary && (
          <button
            onClick={handleAddToDictionary}
            className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add to dictionary</span>
          </button>
        )}
        
        {onIgnore && (
          <button
            onClick={handleIgnore}
            className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4 text-yellow-400" />
            <span>Ignore word</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SpellCheckContextMenu;
