/**
 * VoiceInput component
 * Provides voice input functionality with visual feedback and error handling
 */

import React, { useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import type { VoiceInputProps } from '../types';

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onError,
  className = '',
}) => {
  const voiceInput = useVoiceInput({
    language: 'en-US',
    continuous: false,
    interimResults: true,
    onTranscript: (transcript, confidence) => {
      if (transcript.trim() && onTranscript) {
        onTranscript(transcript.trim());
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
  });

  const tts = useTextToSpeech({
    rate: 1.1,
    pitch: 1,
    volume: 0.8,
  });

  // Auto-speak when voice input is not supported
  useEffect(() => {
    if (!voiceInput.state.isSupported && tts.state.isSupported && tts.state.isEnabled) {
      tts.actions.speak('Voice input is not supported in this browser');
    }
  }, [voiceInput.state.isSupported, tts.state.isSupported, tts.state.isEnabled, tts.actions]);

  const handleMicClick = () => {
    if (!voiceInput.state.isSupported) {
      if (onError) {
        onError('Voice input is not supported in this browser');
      }
      return;
    }

    if (voiceInput.state.isListening) {
      voiceInput.actions.stopListening();
    } else {
      voiceInput.actions.startListening();
    }
  };

  const handleTTSToggle = () => {
    tts.actions.toggle();
    
    // Provide audio feedback
    if (tts.state.isEnabled) {
      setTimeout(() => {
        tts.actions.speak('Voice output disabled');
      }, 100);
    } else {
      setTimeout(() => {
        tts.actions.speak('Voice output enabled');
      }, 100);
    }
  };

  const getMicButtonClass = () => {
    const baseClass = 'p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (!voiceInput.state.isSupported) {
      return `${baseClass} text-gray-300 cursor-not-allowed bg-gray-100`;
    }
    
    if (voiceInput.state.isListening) {
      return `${baseClass} text-white bg-red-500 hover:bg-red-600 focus:ring-red-500 animate-pulse`;
    }
    
    if (voiceInput.state.error) {
      return `${baseClass} text-red-600 bg-red-50 hover:bg-red-100 focus:ring-red-500`;
    }
    
    return `${baseClass} text-primary-600 bg-primary-50 hover:bg-primary-100 focus:ring-primary-500`;
  };

  const getTTSButtonClass = () => {
    const baseClass = 'p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (!tts.state.isSupported) {
      return `${baseClass} text-gray-300 cursor-not-allowed bg-gray-100`;
    }
    
    if (tts.state.isSpeaking) {
      return `${baseClass} text-white bg-accent-500 hover:bg-accent-600 focus:ring-accent-500 animate-pulse`;
    }
    
    if (!tts.state.isEnabled) {
      return `${baseClass} text-gray-400 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500`;
    }
    
    return `${baseClass} text-accent-600 bg-accent-50 hover:bg-accent-100 focus:ring-accent-500`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Voice Input Button */}
      <div className="relative">
        <button
          onClick={handleMicClick}
          disabled={!voiceInput.state.isSupported}
          className={getMicButtonClass()}
          aria-label={
            voiceInput.state.isListening 
              ? 'Stop voice input' 
              : 'Start voice input'
          }
          title={
            !voiceInput.state.isSupported
              ? 'Voice input not supported'
              : voiceInput.state.isListening
              ? 'Click to stop listening'
              : 'Click to start voice input'
          }
        >
          {voiceInput.state.isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Listening indicator */}
        {voiceInput.state.isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </div>

      {/* Text-to-Speech Toggle */}
      <button
        onClick={handleTTSToggle}
        disabled={!tts.state.isSupported}
        className={getTTSButtonClass()}
        aria-label={
          tts.state.isEnabled 
            ? 'Disable voice output' 
            : 'Enable voice output'
        }
        title={
          !tts.state.isSupported
            ? 'Text-to-speech not supported'
            : tts.state.isEnabled
            ? 'Click to disable voice output'
            : 'Click to enable voice output'
        }
      >
        {tts.state.isEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {/* Error indicator */}
      {(voiceInput.state.error || tts.state.error) && (
        <div className="flex items-center text-red-500">
          <AlertCircle className="w-4 h-4" />
        </div>
      )}

      {/* Transcript display (for debugging) */}
      {voiceInput.state.transcript && import.meta.env.DEV && (
        <div className="text-xs text-gray-500 max-w-xs truncate">
          "{voiceInput.state.transcript}"
          {voiceInput.state.confidence > 0 && (
            <span className="ml-1">
              ({Math.round(voiceInput.state.confidence * 100)}%)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
