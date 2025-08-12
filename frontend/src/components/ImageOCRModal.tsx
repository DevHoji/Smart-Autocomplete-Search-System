/**
 * ImageOCRModal component
 * Modal wrapper for image upload and OCR functionality
 */

import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface ImageOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTextExtracted: (text: string) => void;
  onError?: (error: string) => void;
}

const ImageOCRModal: React.FC<ImageOCRModalProps> = ({
  isOpen,
  onClose,
  onTextExtracted,
  onError,
}) => {
  if (!isOpen) return null;

  const handleTextExtracted = (text: string) => {
    onTextExtracted(text);
    onClose(); // Close modal after successful extraction
  };

  const handleError = (error: string) => {
    if (onError) {
      onError(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Extract Text from Image
              </h3>
              <p className="text-sm text-gray-600">
                Upload an image to extract text using OCR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <ImageUpload
            onTextExtracted={handleTextExtracted}
            onError={handleError}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <p>Powered by Tesseract.js OCR engine</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOCRModal;
