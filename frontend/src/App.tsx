import React, { useState, useEffect } from 'react';
import { Search, Mic, Image, Settings, BarChart3, Download } from 'lucide-react';
import { apiService } from './services/api';
import { AnalyticsData } from './types';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Smart Autocomplete Search
                </h1>
                <p className="text-sm text-gray-500">
                  Server-side Trie with Voice & Image Input
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Action Buttons */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connectionError ? (
          /* Connection Error */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Error
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Try the Smart Autocomplete
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Experience fast prefix-based search with voice input, image OCR,
                and real-time learning powered by a server-side Trie data structure.
              </p>

              {/* Search Input Placeholder */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Start typing to see autocomplete suggestions..."
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                    disabled={!isConnected}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                      <Image className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Placeholder for suggestions dropdown */}
                <div className="mt-2 text-sm text-gray-500">
                  {isConnected ? (
                    `Connected to backend with ${analytics?.trie_stats?.word_count || 0} words loaded`
                  ) : (
                    'Waiting for backend connection...'
                  )}
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Fast Search
                </h3>
                <p className="text-gray-600 text-sm">
                  Server-side Trie enables O(P) prefix matching for instant results
                </p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Voice Input
                </h3>
                <p className="text-gray-600 text-sm">
                  Speech-to-text input with text-to-speech suggestions
                </p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Image className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Image OCR
                </h3>
                <p className="text-gray-600 text-sm">
                  Extract text from images using Tesseract.js
                </p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  Real-time analytics and learning from user interactions
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {analytics && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  System Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {analytics.trie_stats.word_count.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-600">
                      {analytics.search_analytics.total_searches.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Searches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.search_analytics.success_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.search_analytics.avg_response_time.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
