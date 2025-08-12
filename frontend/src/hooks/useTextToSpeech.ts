/**
 * Custom hook for text-to-speech using Web Speech API
 * Handles speech synthesis with voice selection and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TTSState, UseTTSReturn } from '../types';

interface UseTextToSpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTTSReturn {
  const {
    rate = 1,
    pitch = 1,
    volume = 1,
    language = 'en-US',
    onStart,
    onEnd,
    onError,
  } = options;

  const [state, setState] = useState<TTSState>({
    isSpeaking: false,
    isEnabled: true,
    isSupported: false,
    error: undefined,
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support and load voices
  useEffect(() => {
    const isSupported = 'speechSynthesis' in window;
    
    setState(prev => ({
      ...prev,
      isSupported,
    }));

    if (isSupported) {
      // Load voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Select default voice for the language
        const defaultVoice = availableVoices.find(voice => 
          voice.lang.startsWith(language.split('-')[0] || 'en')
        ) || availableVoices[0];

        if (defaultVoice) {
          setSelectedVoice(defaultVoice);
        }
      };

      // Load voices immediately
      loadVoices();

      // Also load when voices change (some browsers load them asynchronously)
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [language]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!state.isSupported) {
      const error = 'Text-to-speech is not supported in this browser';
      setState(prev => ({ ...prev, error }));
      if (onError) {
        onError(error);
      }
      return;
    }

    if (!state.isEnabled) {
      return; // TTS is disabled
    }

    if (!text.trim()) {
      return; // No text to speak
    }

    try {
      // Stop any current speech
      speechSynthesis.cancel();

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure utterance
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        setState(prev => ({
          ...prev,
          isSpeaking: true,
          error: undefined,
        }));

        if (onStart) {
          onStart();
        }
      };

      utterance.onend = () => {
        setState(prev => ({
          ...prev,
          isSpeaking: false,
        }));

        if (onEnd) {
          onEnd();
        }
      };

      utterance.onerror = (event) => {
        const errorMessage = `Speech synthesis error: ${event.error}`;
        
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          error: errorMessage,
        }));

        if (onError) {
          onError(errorMessage);
        }
      };

      // Start speaking
      speechSynthesis.speak(utterance);

    } catch (error) {
      const errorMessage = 'Failed to start text-to-speech';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [state.isSupported, state.isEnabled, selectedVoice, rate, pitch, volume, onStart, onEnd, onError]);

  // Stop speaking
  const stop = useCallback(() => {
    if (state.isSpeaking) {
      speechSynthesis.cancel();
      setState(prev => ({
        ...prev,
        isSpeaking: false,
      }));
    }
  }, [state.isSpeaking]);

  // Toggle TTS enabled/disabled
  const toggle = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }));

    // Stop speaking if disabling
    if (state.isEnabled && state.isSpeaking) {
      stop();
    }
  }, [state.isEnabled, state.isSpeaking, stop]);

  // Change voice
  const changeVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  // Get available voices
  const getVoices = useCallback(() => {
    return voices;
  }, [voices]);

  // Get current voice
  const getCurrentVoice = useCallback(() => {
    return selectedVoice;
  }, [selectedVoice]);

  // Speak suggestions (utility method)
  const speakSuggestions = useCallback((suggestions: string[], maxCount: number = 3) => {
    if (!state.isEnabled || suggestions.length === 0) {
      return;
    }

    const topSuggestions = suggestions.slice(0, maxCount);
    let text = '';

    if (topSuggestions.length === 1) {
      text = `Suggestion: ${topSuggestions[0]}`;
    } else {
      text = `Top suggestions: ${topSuggestions.join(', ')}`;
    }

    speak(text);
  }, [state.isEnabled, speak]);

  return {
    state,
    actions: {
      speak,
      stop,
      toggle,
    },
    utils: {
      changeVoice,
      getVoices,
      getCurrentVoice,
      speakSuggestions,
    },
  };
}
