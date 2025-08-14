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
        return 'text-white bg-gradient-to-r from-blue-500 to-purple-600';
      case 'person':
        return 'text-white bg-gradient-to-r from-green-500 to-teal-600';
      case 'action':
        return 'text-white bg-gradient-to-r from-purple-500 to-pink-600';
      case 'communication':
        return 'text-white bg-gradient-to-r from-orange-500 to-red-600';
      case 'media':
        return 'text-white bg-gradient-to-r from-pink-500 to-rose-600';
      case 'web':
        return 'text-white bg-gradient-to-r from-indigo-500 to-blue-600';
      case 'work':
        return 'text-black bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'noun':
        return 'text-white bg-gradient-to-r from-emerald-500 to-green-600';
      case 'adjective':
        return 'text-white bg-gradient-to-r from-violet-500 to-purple-600';
      case 'verb':
        return 'text-white bg-gradient-to-r from-rose-500 to-pink-600';
      case 'amharic':
        return 'text-white bg-gradient-to-r from-amber-500 to-yellow-600';
      default:
        return 'text-white bg-gradient-to-r from-gray-500 to-gray-600';
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
            <span className="text-yellow-300 font-bold text-lg truncate">
              {highlightText(suggestion.word, highlightQuery)}
            </span>

            {/* Frequency badge */}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-bold bg-cyan-500 text-white shadow-lg">
              {suggestion.freq}
            </span>
          </div>

          {/* Synonyms */}
          {suggestion.synonyms && suggestion.synonyms.length > 0 && (
            <div className="mt-1 flex items-center space-x-1">
              <span className="text-sm text-green-400 font-medium">Also:</span>
              <div className="flex flex-wrap gap-1">
                {suggestion.synonyms.slice(0, 3).map((synonym, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-600 text-white font-medium"
                  >
                    {synonym}
                  </span>
                ))}
                {suggestion.synonyms.length > 3 && (
                  <span className="text-sm text-green-300 font-medium">
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
        <div className="mt-2 text-sm text-blue-300 font-medium">
          {Object.entries(suggestion.metadata)
            .slice(0, 2)
            .map(([key, value]) => (
              <span key={key} className="mr-3 bg-blue-800 px-2 py-1 rounded">
                {key}: {String(value)}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionItem;
