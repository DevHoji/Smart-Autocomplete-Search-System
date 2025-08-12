/**
 * Custom hook for voice input using Web Speech API
 * Handles speech-to-text functionality with error handling and browser compatibility
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceState, UseVoiceReturn } from '../types/index';

interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onTranscript?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceReturn {
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    onTranscript,
    onError,
    onStart,
    onEnd,
  } = options;

  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0,
    error: undefined,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = 
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    const isSupported = !!SpeechRecognition;
    
    setState(prev => ({
      ...prev,
      isSupported,
    }));

    if (isSupported) {
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = language;
      recognitionRef.current.maxAlternatives = maxAlternatives;

      // Event handlers
      recognitionRef.current.onstart = () => {
        setState(prev => ({
          ...prev,
          isListening: true,
          error: undefined,
        }));
        
        if (onStart) {
          onStart();
        }
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || '';
          const confidence = result[0]?.confidence || 0;

          if (result.isFinal) {
            finalTranscript += transcript;
            maxConfidence = Math.max(maxConfidence, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        const finalConfidence = finalTranscript ? maxConfidence : 0;

        setState(prev => ({
          ...prev,
          transcript: fullTranscript,
          confidence: finalConfidence,
        }));

        if (finalTranscript && onTranscript) {
          onTranscript(finalTranscript, finalConfidence);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed.';
            break;
          case 'bad-grammar':
            errorMessage = 'Grammar error in speech recognition.';
            break;
          case 'language-not-supported':
            errorMessage = `Language ${language} is not supported.`;
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        setState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage,
        }));

        if (onError) {
          onError(errorMessage);
        }
      };

      recognitionRef.current.onend = () => {
        setState(prev => ({
          ...prev,
          isListening: false,
        }));

        if (onEnd) {
          onEnd();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, onTranscript, onError, onStart, onEnd]);

  // Start listening
  const startListening = useCallback(() => {
    if (!state.isSupported || !recognitionRef.current) {
      const error = 'Speech recognition is not supported in this browser';
      setState(prev => ({ ...prev, error }));
      if (onError) {
        onError(error);
      }
      return;
    }

    if (state.isListening) {
      return; // Already listening
    }

    try {
      // Clear previous transcript
      setState(prev => ({
        ...prev,
        transcript: '',
        confidence: 0,
        error: undefined,
      }));

      recognitionRef.current.start();

      // Auto-stop after 30 seconds to prevent indefinite listening
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);

    } catch (error) {
      const errorMessage = 'Failed to start speech recognition';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [state.isSupported, state.isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [state.isListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      confidence: 0,
      error: undefined,
    }));
  }, []);

  return {
    state,
    actions: {
      startListening,
      stopListening,
      clearTranscript,
    },
  };
}
