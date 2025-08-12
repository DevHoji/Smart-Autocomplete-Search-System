/**
 * SuggestionItem component
 * Displays individual autocomplete suggestions with highlighting and metadata
 */

import React from 'react';
import { Hash, Tag, Users } from 'lucide-react';
import type { SuggestionItemProps } from '../types';

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  isSelected,
  onSelect,
  highlightQuery,
}) => {
  // Highlight matching text in the suggestion
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark key={index} className="bg-primary-100 text-primary-900 font-medium">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Get category icon
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'technology':
        return <Hash className="w-3 h-3" />;
      case 'person':
        return <Users className="w-3 h-3" />;
      default:
        return <Tag className="w-3 h-3" />;
    }
  };

  // Get category color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'technology':
        return 'text-blue-600 bg-blue-100';
      case 'person':
        return 'text-green-600 bg-green-100';
      case 'action':
        return 'text-purple-600 bg-purple-100';
      case 'communication':
        return 'text-orange-600 bg-orange-100';
      case 'media':
        return 'text-pink-600 bg-pink-100';
      case 'web':
        return 'text-indigo-600 bg-indigo-100';
      case 'work':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleClick = () => {
    onSelect(suggestion);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(suggestion);
    }
  };

  return (
    <div
      className={`suggestion-item ${isSelected ? 'active' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Main word */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 font-medium truncate">
              {highlightText(suggestion.word, highlightQuery)}
            </span>
            
            {/* Frequency badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {suggestion.freq}
            </span>
          </div>

          {/* Synonyms */}
          {suggestion.synonyms && suggestion.synonyms.length > 0 && (
            <div className="mt-1 flex items-center space-x-1">
              <span className="text-xs text-gray-500">Also:</span>
              <div className="flex flex-wrap gap-1">
                {suggestion.synonyms.slice(0, 3).map((synonym, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-50 text-gray-600"
                  >
                    {synonym}
                  </span>
                ))}
                {suggestion.synonyms.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{suggestion.synonyms.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Category badge */}
        {suggestion.category && (
          <div className="flex-shrink-0 ml-3">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                suggestion.category
              )}`}
            >
              {getCategoryIcon(suggestion.category)}
              <span className="ml-1 capitalize">{suggestion.category}</span>
            </span>
          </div>
        )}
      </div>

      {/* Metadata */}
      {suggestion.metadata && Object.keys(suggestion.metadata).length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {Object.entries(suggestion.metadata)
            .slice(0, 2)
            .map(([key, value]) => (
              <span key={key} className="mr-3">
                {key}: {String(value)}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionItem;
