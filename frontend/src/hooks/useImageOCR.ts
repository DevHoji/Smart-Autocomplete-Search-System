/**
 * Custom hook for image OCR using Tesseract.js
 * Handles text extraction from images with progress tracking and error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { createWorker, Worker } from 'tesseract.js';
import { OCRState } from '../types/index';

interface UseImageOCROptions {
  language?: string;
  onProgress?: (progress: number) => void;
  onTextExtracted?: (text: string, confidence: number) => void;
  onError?: (error: string) => void;
}

interface UseImageOCRReturn {
  state: OCRState;
  actions: {
    extractText: (imageFile: File | string) => Promise<string>;
    extractTextFromDataURL: (dataURL: string) => Promise<string>;
    cancel: () => void;
    clearResults: () => void;
  };
}

export function useImageOCR(options: UseImageOCROptions = {}): UseImageOCRReturn {
  const {
    language = 'eng',
    onProgress,
    onTextExtracted,
    onError,
  } = options;

  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    extractedText: '',
    confidence: 0,
    error: undefined,
  });

  const workerRef = useRef<Worker | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize Tesseract worker
  const initializeWorker = useCallback(async () => {
    if (isInitializedRef.current && workerRef.current) {
      return workerRef.current;
    }

    try {
      const worker = await createWorker(language, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(m.progress);
          }
        },
      });

      workerRef.current = worker;
      isInitializedRef.current = true;
      return worker;
    } catch (error) {
      const errorMessage = 'Failed to initialize OCR worker';
      setState(prev => ({ ...prev, error: errorMessage }));
      if (onError) {
        onError(errorMessage);
      }
      throw error;
    }
  }, [language, onProgress, onError]);

  // Extract text from image file or URL
  const extractText = useCallback(async (imageFile: File | string): Promise<string> => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: undefined,
      extractedText: '',
      confidence: 0,
    }));

    try {
      const worker = await initializeWorker();
      
      const { data } = await worker.recognize(imageFile);
      
      const extractedText = data.text.trim();
      const confidence = data.confidence;

      setState(prev => ({
        ...prev,
        isProcessing: false,
        extractedText,
        confidence,
      }));

      if (onTextExtracted) {
        onTextExtracted(extractedText, confidence);
      }

      return extractedText;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to extract text from image';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));

      if (onError) {
        onError(errorMessage);
      }

      throw error;
    }
  }, [initializeWorker, onTextExtracted, onError]);

  // Extract text from data URL (base64 image)
  const extractTextFromDataURL = useCallback(async (dataURL: string): Promise<string> => {
    return extractText(dataURL);
  }, [extractText]);

  // Cancel current OCR operation
  const cancel = useCallback(async () => {
    if (workerRef.current && state.isProcessing) {
      try {
        await workerRef.current.terminate();
        workerRef.current = null;
        isInitializedRef.current = false;
        
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: 'OCR operation cancelled',
        }));
      } catch (error) {
        console.error('Error cancelling OCR:', error);
      }
    }
  }, [state.isProcessing]);

  // Clear results
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      extractedText: '',
      confidence: 0,
      error: undefined,
    }));
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(async () => {
    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
      } catch (error) {
        console.error('Error terminating OCR worker:', error);
      }
      workerRef.current = null;
      isInitializedRef.current = false;
    }
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    actions: {
      extractText,
      extractTextFromDataURL,
      cancel,
      clearResults,
    },
  };
}
