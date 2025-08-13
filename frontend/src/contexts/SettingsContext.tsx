/**
 * Settings Context
 * Provides global settings management with persistence and real-time effects
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SettingsState {
  // Audio Settings
  ttsEnabled: boolean;
  voiceInputEnabled: boolean;
  volume: number;
  voiceSpeed: number;
  
  // Visual Settings
  animationsEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Search Settings
  maxSuggestions: number;
  autoComplete: boolean;
  fuzzySearch: boolean;
  searchDelay: number;
  
  // Privacy Settings
  analyticsEnabled: boolean;
  searchHistory: boolean;
  notifications: boolean;
  
  // Performance Settings
  cacheEnabled: boolean;
  prefetchEnabled: boolean;
}

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  // Audio Settings
  ttsEnabled: true,
  voiceInputEnabled: true,
  volume: 70,
  voiceSpeed: 1.0,
  
  // Visual Settings
  animationsEnabled: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  
  // Search Settings
  maxSuggestions: 10,
  autoComplete: true,
  fuzzySearch: true,
  searchDelay: 300,
  
  // Privacy Settings
  analyticsEnabled: true,
  searchHistory: true,
  notifications: true,
  
  // Performance Settings
  cacheEnabled: true,
  prefetchEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('smartAutocomplete_settings');
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('smartAutocomplete_settings', JSON.stringify(settings));
  }, [settings]);

  // Apply visual settings to the document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply animations setting
    if (settings.animationsEnabled) {
      root.classList.remove('no-animations');
    } else {
      root.classList.add('no-animations');
    }
    
    // Apply reduced motion setting
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Apply high contrast setting
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply font size setting
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${settings.fontSize}`);
    
  }, [settings.animationsEnabled, settings.reducedMotion, settings.highContrast, settings.fontSize]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('smartAutocomplete_settings');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
