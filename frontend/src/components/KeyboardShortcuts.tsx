/**
 * KeyboardShortcuts component
 * Displays helpful keyboard shortcuts for the autocomplete interface
 */

import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  };

  const shortcuts = [
    {
      keys: ['↑', '↓'],
      description: 'Navigate through suggestions',
    },
    {
      keys: ['Enter'],
      description: 'Select highlighted suggestion',
    },
    {
      keys: ['Escape'],
      description: 'Close suggestions and clear focus',
    },
    {
      keys: ['Tab'],
      description: 'Close suggestions',
    },
    {
      keys: ['Ctrl', '/'],
      description: 'Focus search input',
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={handleBackdropClick}
        >
          <div className="card max-w-md w-full p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold gradient-text">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center space-x-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-900 bg-yellow-400/20 border border-yellow-400/30 rounded">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-xs text-gray-400">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                These shortcuts work when the search input is focused. Press <kbd className="px-1 py-0.5 text-xs bg-yellow-400/20 border border-yellow-400/30 rounded">Esc</kbd> to close this dialog.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
