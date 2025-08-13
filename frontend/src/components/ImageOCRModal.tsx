/**
 * ImageOCRModal component
 * Enhanced modal for image upload and OCR functionality with spell checking
 */

import React, { useState } from 'react';
import { X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { useSpellChecker } from '../hooks/useSpellChecker';

interface ImageOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTextExtracted: (text: string) => void;
  onError?: (error: string) => void;
  enableSpellCheck?: boolean;
}

const ImageOCRModal: React.FC<ImageOCRModalProps> = ({
  isOpen,
  onClose,
  onTextExtracted,
  onError,
  enableSpellCheck = true,
}) => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Spell checker for OCR text
  const {
    misspelledWords,
    checkText,
    getSuggestions
  } = useSpellChecker({
    enabled: enableSpellCheck,
  });

  if (!isOpen) return null;

  const handleTextExtracted = async (text: string) => {
    setExtractedText(text);
    setIsProcessing(true);

    // Check spelling if enabled
    if (enableSpellCheck && text.trim()) {
      await checkText(text);
    }

    setIsProcessing(false);
    setShowPreview(true);
  };

  const handleConfirmText = () => {
    onTextExtracted(extractedText);
    handleClose();
  };

  const handleClose = () => {
    setExtractedText('');
    setShowPreview(false);
    setIsProcessing(false);
    onClose();
  };

  const handleError = (error: string) => {
    setIsProcessing(false);
    if (onError) {
      onError(error);
    }
  };

  // Apply spell corrections to text
  const handleSpellCorrection = (originalWord: string, correctedWord: string) => {
    const newText = extractedText.replace(
      new RegExp(`\\b${originalWord}\\b`, 'g'),
      correctedWord
    );
    setExtractedText(newText);

    // Re-check spelling after correction
    if (enableSpellCheck) {
      checkText(newText);
    }
  };

  // Render text with spell check highlights
  const renderTextWithSpellCheck = (text: string) => {
    if (!enableSpellCheck || misspelledWords.length === 0) {
      return text;
    }

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    misspelledWords.forEach((misspelled, index) => {
      // Add text before misspelled word
      if (misspelled.start > lastIndex) {
        elements.push(text.slice(lastIndex, misspelled.start));
      }

      // Add misspelled word with highlighting
      elements.push(
        <span
          key={index}
          className="bg-red-500/20 border-b-2 border-red-400 cursor-pointer"
          title={`Suggestions: ${misspelled.suggestions.join(', ')}`}
          onClick={() => {
            if (misspelled.suggestions.length > 0) {
              handleSpellCorrection(misspelled.word, misspelled.suggestions[0]);
            }
          }}
        >
          {misspelled.word}
        </span>
      );

      lastIndex = misspelled.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold gradient-text">
                Extract Text from Image
              </h3>
              <p className="text-sm text-gray-400">
                Upload an image to extract text using OCR
                {enableSpellCheck && ' with automatic spell checking'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showPreview ? (
            <ImageUpload
              onTextExtracted={handleTextExtracted}
              onError={handleError}
              className="w-full"
            />
          ) : (
            <div className="space-y-4">
              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                    <span className="text-gray-300">
                      {enableSpellCheck ? 'Processing and checking spelling...' : 'Processing...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Extracted text preview */}
              {!isProcessing && (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium gradient-text">Extracted Text</h4>
                    {enableSpellCheck && misspelledWords.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">
                          {misspelledWords.length} spelling {misspelledWords.length === 1 ? 'error' : 'errors'} found
                        </span>
                      </div>
                    )}
                    {enableSpellCheck && misspelledWords.length === 0 && extractedText.trim() && (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">No spelling errors</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 min-h-32 max-h-64 overflow-y-auto">
                    <div className="text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {renderTextWithSpellCheck(extractedText)}
                    </div>
                  </div>

                  {enableSpellCheck && misspelledWords.length > 0 && (
                    <div className="text-xs text-gray-400">
                      💡 Click on highlighted words to apply the first suggestion, or right-click for more options
                    </div>
                  )}

                  {/* Text editing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Edit extracted text (optional):
                    </label>
                    <textarea
                      value={extractedText}
                      onChange={(e) => {
                        setExtractedText(e.target.value);
                        if (enableSpellCheck) {
                          checkText(e.target.value);
                        }
                      }}
                      className="input-field w-full h-32 resize-none"
                      placeholder="Edit the extracted text if needed..."
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-600 rounded-b-xl">
          <div className="flex items-center justify-between">
            {!showPreview ? (
              <>
                <p className="text-sm text-gray-400">
                  Supported formats: JPG, PNG, GIF, WebP • Max size: 10MB
                </p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Upload Another
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmText}
                    disabled={!extractedText.trim()}
                    className="px-4 py-2 text-sm font-medium bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Use This Text
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOCRModal;
