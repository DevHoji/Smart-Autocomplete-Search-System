import React, { useState, useEffect } from 'react';
import { Search, Mic, Image, Settings as SettingsIcon, BarChart3, Download } from 'lucide-react';
import { apiService } from './services/api';
import type { AnalyticsData, Suggestion } from './types/index';
import Autocomplete from './components/Autocomplete';
import KeyboardShortcuts from './components/KeyboardShortcuts';

import AnalyticsDashboard from './components/AnalyticsDashboard';
import Settings from './components/Settings';
import DownloadModal from './components/DownloadModal';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const [currentView, setCurrentView] = useState<'search' | 'analytics' | 'settings'>('search');

  useEffect(() => {
    // Test API connection on startup
    const testConnection = async () => {
      try {
        const connected = await apiService.testConnection();
        setIsConnected(connected);

        if (connected) {
          // Load initial analytics data
          const analyticsData = await apiService.getAnalytics(7);
          setAnalytics(analyticsData);
        } else {
          setConnectionError('Unable to connect to the backend server');
        }
      } catch (error) {
        setIsConnected(false);
        setConnectionError('Failed to connect to the backend server');
        console.error('Connection test failed:', error);
      }
    };

    testConnection();
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    console.log('Selected suggestion:', suggestion);
  };

  // Handle search
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };



  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-glass border-b border-gray-700 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center pulse-glow">
                <Search className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  Smart Autocomplete Search
                </h1>
                <p className="text-sm text-gray-400">
                  Server-side Trie with Voice & Image Input
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full pulse-glow ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-300">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Action Buttons */}
              <KeyboardShortcuts />
              <button
                onClick={() => setCurrentView('settings')}
                className={`p-2 transition-all duration-300 hover:scale-110 ${
                  currentView === 'settings'
                    ? 'text-yellow-400 bg-yellow-400/10 border-glow'
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentView(currentView === 'analytics' ? 'search' : 'analytics')}
                className={`p-2 transition-all duration-300 hover:scale-110 ${
                  currentView === 'analytics'
                    ? 'text-yellow-400 bg-yellow-400/10 border-glow'
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
                title={currentView === 'analytics' ? 'Back to Search' : 'View Analytics'}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110"
                title="Export Data"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'analytics' ? (
          /* Analytics Dashboard */
          <AnalyticsDashboard onBack={() => setCurrentView('search')} />
        ) : currentView === 'settings' ? (
          /* Settings Page */
          <Settings onBack={() => setCurrentView('search')} />
        ) : connectionError ? (
          /* Connection Error */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
              <Search className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              Connection Error
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {connectionError}. Please make sure the backend server is running on port 3001.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          /* Main Interface */
          <div className="space-y-8">
            {/* Search Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold gradient-text mb-4 float-animation">
                Try the Smart Autocomplete
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto text-shadow">
                Experience fast prefix-based search with voice input, image OCR,
                and real-time learning powered by a server-side Trie data structure.
              </p>

              {/* Autocomplete Search */}
              <div className="max-w-2xl mx-auto">
                <Autocomplete
                  placeholder="Start typing to see autocomplete suggestions..."
                  maxSuggestions={10}
                  onSelect={handleSuggestionSelect}
                  onSearch={handleSearch}
                  className="mb-4"
                />

                {/* Connection Status */}
                <div className="text-center text-sm text-gray-400">
                  {isConnected ? (
                    <span className="glow-text">
                      Connected to backend with {analytics?.trie_stats?.word_count || 0} words loaded
                    </span>
                  ) : (
                    <span className="text-red-400">Waiting for backend connection...</span>
                  )}
                </div>

                {/* Selected Suggestion Display */}
                {selectedSuggestion && (
                  <div className="mt-4 p-4 card hover-lift">
                    <h4 className="font-medium text-yellow-400 mb-2">Selected:</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-semibold glow-text">
                          {selectedSuggestion.word}
                        </span>
                        {selectedSuggestion.category && (
                          <span className="ml-2 badge badge-primary">
                            {selectedSuggestion.category}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-yellow-300">
                        Frequency: {selectedSuggestion.freq}
                      </span>
                    </div>
                    {selectedSuggestion.synonyms && selectedSuggestion.synonyms.length > 0 && (
                      <div className="mt-2 text-sm text-gray-300">
                        <strong className="text-yellow-400">Synonyms:</strong> {selectedSuggestion.synonyms.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center hover-lift float-animation">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 pulse-glow">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Fast Search
                </h3>
                <p className="text-gray-400 text-sm">
                  Server-side Trie enables O(P) prefix matching for instant results
                </p>
              </div>

              <div className="card text-center hover-lift float-animation" style={{animationDelay: '0.5s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 pulse-glow">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Voice Input
                </h3>
                <p className="text-gray-400 text-sm">
                  Speech-to-text input with text-to-speech suggestions
                </p>
              </div>

              <div className="card text-center hover-lift float-animation" style={{animationDelay: '1s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 pulse-glow">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Image OCR
                </h3>
                <p className="text-gray-400 text-sm">
                  Extract text from images using Tesseract.js
                </p>
              </div>

              <div className="card text-center hover-lift float-animation" style={{animationDelay: '1.5s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 pulse-glow">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Analytics
                </h3>
                <p className="text-gray-400 text-sm">
                  Real-time analytics and learning from user interactions
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {analytics && (
              <div className="card hover-lift">
                <h3 className="text-lg font-semibold gradient-text mb-4">
                  System Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold glow-text">
                      {analytics.trie_stats.word_count.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {analytics.search_analytics.total_searches.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Searches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {analytics.search_analytics.success_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {analytics.search_analytics.avg_response_time.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-400">Avg Response</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        analytics={analytics}
      />
    </div>
  );
}

export default App;
