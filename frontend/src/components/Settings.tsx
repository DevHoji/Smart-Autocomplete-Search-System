import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Save,
  Moon,
  Palette,
  Zap,
  Shield,
  Bell,
  BellOff
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsProps {
  onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSetting, resetSettings: contextResetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'visual' | 'search' | 'privacy' | 'performance'>('general');

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      contextResetSettings();
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'autocomplete-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          // Apply imported settings one by one
          Object.entries(importedSettings).forEach(([key, value]) => {
            if (key in settings) {
              updateSetting(key as keyof typeof settings, value as never);
            }
          });
        } catch {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'search', label: 'Search', icon: Zap },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'performance', label: 'Performance', icon: RefreshCw },
  ] as const;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-glass border-b border-gray-700 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                  title="Back to Main"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back</span>
                </button>
              )}
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center pulse-glow">
                <SettingsIcon className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Settings</h1>
                <p className="text-sm text-gray-400">Customize your autocomplete experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportSettings}
                className="p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110"
                title="Export Settings"
              >
                <Download className="w-5 h-5" />
              </button>
              <label className="p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110 cursor-pointer" title="Import Settings">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
              <button
                onClick={resetSettings}
                className="p-2 text-gray-400 hover:text-red-400 transition-all duration-300 hover:scale-110"
                title="Reset to Defaults"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold gradient-text mb-4">Categories</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-yellow-400/20 text-yellow-400 border-l-4 border-yellow-400'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="card">
              {activeTab === 'general' && (
                <div>
                  <h3 className="text-xl font-semibold gradient-text mb-6">General Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Theme</h4>
                        <p className="text-sm text-gray-400">Current theme: Dark Mode</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Moon className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Dark</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Font Size</h4>
                        <p className="text-sm text-gray-400">Adjust text size for better readability</p>
                      </div>
                      <select
                        value={settings.fontSize}
                        onChange={(e) => updateSetting('fontSize', e.target.value as 'small' | 'medium' | 'large')}
                        className="input-field w-32"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div>
                  <h3 className="text-xl font-semibold gradient-text mb-6">Audio Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Text-to-Speech</h4>
                        <p className="text-sm text-gray-400">Enable voice reading of suggestions</p>
                      </div>
                      <button
                        onClick={() => updateSetting('ttsEnabled', !settings.ttsEnabled)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.ttsEnabled ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        {settings.ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Voice Input</h4>
                        <p className="text-sm text-gray-400">Enable speech-to-text input</p>
                      </div>
                      <button
                        onClick={() => updateSetting('voiceInputEnabled', !settings.voiceInputEnabled)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.voiceInputEnabled ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        {settings.voiceInputEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-200">Volume</h4>
                        <span className="text-yellow-400 font-medium">{settings.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.volume}
                        onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-200">Speech Speed</h4>
                        <span className="text-yellow-400 font-medium">{settings.voiceSpeed}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.voiceSpeed}
                        onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visual' && (
                <div>
                  <h3 className="text-xl font-semibold gradient-text mb-6">Visual Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Animations</h4>
                        <p className="text-sm text-gray-400">Enable smooth animations and transitions</p>
                      </div>
                      <button
                        onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.animationsEnabled ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        {settings.animationsEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Reduced Motion</h4>
                        <p className="text-sm text-gray-400">Minimize motion for accessibility</p>
                      </div>
                      <button
                        onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.reducedMotion ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        {settings.reducedMotion ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">High Contrast</h4>
                        <p className="text-sm text-gray-400">Increase contrast for better visibility</p>
                      </div>
                      <button
                        onClick={() => updateSetting('highContrast', !settings.highContrast)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.highContrast ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        <Palette className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'search' && (
                <div>
                  <h3 className="text-xl font-semibold gradient-text mb-6">Search Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-200">Max Suggestions</h4>
                        <span className="text-yellow-400 font-medium">{settings.maxSuggestions}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        value={settings.maxSuggestions}
                        onChange={(e) => updateSetting('maxSuggestions', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Auto Complete</h4>
                        <p className="text-sm text-gray-400">Automatically show suggestions while typing</p>
                      </div>
                      <button
                        onClick={() => updateSetting('autoComplete', !settings.autoComplete)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.autoComplete ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Fuzzy Search</h4>
                        <p className="text-sm text-gray-400">Enable approximate string matching</p>
                      </div>
                      <button
                        onClick={() => updateSetting('fuzzySearch', !settings.fuzzySearch)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.fuzzySearch ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-200">Search Delay</h4>
                        <span className="text-yellow-400 font-medium">{settings.searchDelay}ms</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        step="100"
                        value={settings.searchDelay}
                        onChange={(e) => updateSetting('searchDelay', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h3 className="text-xl font-semibold gradient-text mb-6">Privacy Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Analytics</h4>
                        <p className="text-sm text-gray-400">Allow usage analytics collection</p>
                      </div>
                      <button
                        onClick={() => updateSetting('analyticsEnabled', !settings.analyticsEnabled)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.analyticsEnabled ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        <Shield className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Search History</h4>
                        <p className="text-sm text-gray-400">Save search history for better suggestions</p>
                      </div>
                      <button
                        onClick={() => updateSetting('searchHistory', !settings.searchHistory)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.searchHistory ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        <Shield className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Notifications</h4>
                        <p className="text-sm text-gray-400">Enable system notifications</p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifications', !settings.notifications)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.notifications ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        {settings.notifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-red-400 mb-2">Clear Data</h4>
                      <p className="text-sm text-gray-400 mb-4">Remove all stored search history and preferences</p>
                      <button className="btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div>
                  <h3 className="text-xl font-semibold gradient-text mb-6">Performance Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Cache Enabled</h4>
                        <p className="text-sm text-gray-400">Cache suggestions for faster loading</p>
                      </div>
                      <button
                        onClick={() => updateSetting('cacheEnabled', !settings.cacheEnabled)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.cacheEnabled ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Prefetch</h4>
                        <p className="text-sm text-gray-400">Preload popular suggestions</p>
                      </div>
                      <button
                        onClick={() => updateSetting('prefetchEnabled', !settings.prefetchEnabled)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          settings.prefetchEnabled ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-gray-700'
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-blue-400 mb-2">Performance Info</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Cache Size:</span>
                          <span className="text-blue-400 ml-2">2.3 MB</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Avg Response:</span>
                          <span className="text-blue-400 ml-2">45ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Memory Usage:</span>
                          <span className="text-blue-400 ml-2">12.5 MB</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Uptime:</span>
                          <span className="text-blue-400 ml-2">2h 34m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Settings are automatically saved
                  </p>
                  <button className="btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
