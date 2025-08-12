/**
 * ImageUpload component
 * Provides image upload functionality with OCR text extraction
 */

import React, { useRef, useState } from 'react';
import { Image, Upload, X, Loader2, FileText, Camera, AlertCircle } from 'lucide-react';
import { useImageOCR } from '../hooks/useImageOCR';
import { ImageUploadProps } from '../types/index';

const ImageUpload: React.FC<ImageUploadProps> = ({
  onTextExtracted,
  onError,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const { state: ocrState, actions: ocrActions } = useImageOCR({
    language: 'eng',
    onTextExtracted: (text, confidence) => {
      if (text.trim() && onTextExtracted) {
        onTextExtracted(text.trim());
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
  });

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      const error = 'Please select a valid image file';
      if (onError) {
        onError(error);
      }
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const error = 'Image file is too large. Please select a file smaller than 10MB';
      if (onError) {
        onError(error);
      }
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target?.result as string;
      setImagePreview(dataURL);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Extract text from selected image
  const handleExtractText = async () => {
    if (!selectedImage) return;

    try {
      await ocrActions.extractText(selectedImage);
    } catch (error) {
      console.error('OCR extraction failed:', error);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedImage(null);
    setImagePreview('');
    ocrActions.clearResults();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file dialog
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
          ${dragOver 
            ? 'border-primary-400 bg-primary-50' 
            : selectedImage 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!selectedImage ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload an image for OCR
              </p>
              <p className="text-sm text-gray-600">
                Drag and drop an image here, or click to select
              </p>
            </div>
            <button
              onClick={handleUploadClick}
              className="btn-primary"
            >
              <Camera className="w-4 h-4 mr-2" />
              Select Image
            </button>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, GIF up to 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Image Preview */}
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Selected image"
                className="max-w-full max-h-48 rounded-lg shadow-sm"
              />
              <button
                onClick={handleClear}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File Info */}
            <div className="text-sm text-gray-600">
              <p className="font-medium">{selectedImage.name}</p>
              <p>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            {/* Extract Button */}
            {!ocrState.isProcessing && !ocrState.extractedText && (
              <button
                onClick={handleExtractText}
                className="btn-primary"
                disabled={ocrState.isProcessing}
              >
                <FileText className="w-4 h-4 mr-2" />
                Extract Text
              </button>
            )}
          </div>
        )}
      </div>

      {/* OCR Processing */}
      {ocrState.isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Extracting text from image...
              </p>
              <p className="text-xs text-blue-700">
                This may take a few seconds
              </p>
            </div>
          </div>
        </div>
      )}

      {/* OCR Results */}
      {ocrState.extractedText && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                Extracted Text
                {ocrState.confidence > 0 && (
                  <span className="ml-2 text-xs text-green-700">
                    ({Math.round(ocrState.confidence)}% confidence)
                  </span>
                )}
              </h4>
              <div className="bg-white border border-green-200 rounded p-3 text-sm text-gray-900 max-h-32 overflow-y-auto">
                {ocrState.extractedText}
              </div>
            </div>
            <button
              onClick={ocrActions.clearResults}
              className="ml-3 p-1 text-green-600 hover:text-green-800 transition-colors"
              aria-label="Clear results"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* OCR Error */}
      {ocrState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">
                OCR Error
              </p>
              <p className="text-xs text-red-700">
                {ocrState.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Tips for better OCR results:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use high-resolution images with clear text</li>
          <li>Ensure good contrast between text and background</li>
          <li>Avoid blurry or skewed images</li>
          <li>Text should be horizontal and well-lit</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;
