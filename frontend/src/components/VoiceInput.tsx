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
    onTranscript: (transcript, _confidence) => {
      if (transcript.trim() && onTranscript) {
        // Process the transcript to handle partial words and single letters
        const processedTranscript = processVoiceTranscript(transcript.trim());
        onTranscript(processedTranscript);
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
  });

  // Function to process voice transcript for better autocomplete
  const processVoiceTranscript = (transcript: string): string => {
    // Convert to lowercase for consistency
    const processed = transcript.toLowerCase();

    // Handle single letters - common voice recognition patterns
    const singleLetterMap: Record<string, string> = {
      'see': 'c',
      'sea': 'c',
      'bee': 'b',
      'pee': 'p',
      'tea': 't',
      'you': 'u',
      'why': 'y',
      'are': 'r',
      'oh': 'o',
      'owe': 'o',
      'eye': 'i',
      'ay': 'a',
      'eh': 'a',
      'ex': 'x',
      'kay': 'k',
      'queue': 'q',
      'cue': 'q',
      'jay': 'j',
      'em': 'm',
      'en': 'n',
      'eff': 'f',
      'ell': 'l',
      'ess': 's',
      'zed': 'z',
      'zee': 'z'
    };

    // Check if it's a single letter pronunciation
    if (singleLetterMap[processed]) {
      return singleLetterMap[processed];
    }

    // Handle common partial word patterns
    const partialWordMap: Record<string, string> = {
      'comp': 'computer',
      'tech': 'technology',
      'prog': 'programming',
      'java': 'javascript',
      'py': 'python',
      'app': 'application',
      'dev': 'development',
      'web': 'website',
      'net': 'internet',
      'soft': 'software',
      'data': 'database',
      'algo': 'algorithm',
      'func': 'function',
      'var': 'variable',
      'obj': 'object',
      'arr': 'array',
      'str': 'string',
      'num': 'number',
      'bool': 'boolean',
      'int': 'integer',
      'char': 'character',
      'doc': 'document',
      'elem': 'element',
      'attr': 'attribute',
      'prop': 'property',
      'meth': 'method',
      'class': 'class',
      'mod': 'module',
      'lib': 'library',
      'frame': 'framework',
      'serv': 'server',
      'cli': 'client',
      'api': 'api',
      'rest': 'rest',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'js': 'javascript',
      'ts': 'typescript',
      'react': 'react',
      'vue': 'vue',
      'angular': 'angular',
      'node': 'nodejs',
      'npm': 'npm',
      'git': 'git',
      'github': 'github',
      'sql': 'sql',
      'db': 'database',
      'ui': 'interface',
      'ux': 'experience'
    };

    // Check if it matches a partial word pattern
    for (const [partial, full] of Object.entries(partialWordMap)) {
      if (processed === partial || processed.startsWith(partial + ' ')) {
        return full;
      }
    }

    // Handle phonetic variations and common misrecognitions
    const phoneticMap: Record<string, string> = {
      'see plus plus': 'c++',
      'c plus plus': 'c++',
      'see sharp': 'c#',
      'c sharp': 'c#',
      'dot net': '.net',
      'dotnet': '.net',
      'my sequel': 'mysql',
      'my s q l': 'mysql',
      'post gres': 'postgresql',
      'postgres': 'postgresql',
      'mongo d b': 'mongodb',
      'mongo': 'mongodb',
      'redis': 'redis',
      'elastic search': 'elasticsearch',
      'docker': 'docker',
      'kubernetes': 'kubernetes',
      'aws': 'aws',
      'amazon web services': 'aws',
      'google cloud': 'gcp',
      'microsoft azure': 'azure',
      'artificial intelligence': 'ai',
      'machine learning': 'ml',
      'deep learning': 'dl',
      'neural network': 'neural',
      'blockchain': 'blockchain',
      'crypto currency': 'cryptocurrency',
      'bit coin': 'bitcoin',
      'ether eum': 'ethereum'
    };

    // Check phonetic variations
    for (const [phonetic, correct] of Object.entries(phoneticMap)) {
      if (processed === phonetic || processed.includes(phonetic)) {
        return correct;
      }
    }

    // Return the original transcript if no special processing is needed
    return processed;
  };

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
