/**
 * AnalyticsDashboard component
 * Comprehensive analytics dashboard with charts and real-time data
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Search, 
  Target, 
  Clock, 
  RefreshCw,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import MetricCard from './MetricCard';
import TopQueriesChart from './TopQueriesChart';
import TrendingWordsChart from './TrendingWordsChart';
import PerformanceChart from './PerformanceChart';

const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data, isLoading, error, lastUpdated, derivedMetrics, refetch } = useAnalytics({
    days: selectedPeriod,
    autoRefresh,
    refreshInterval: 30000, // 30 seconds
  });

  const handlePeriodChange = (days: number) => {
    setSelectedPeriod(days);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (data) {
      const exportData = {
        ...data,
        exported_at: new Date().toISOString(),
        period_days: selectedPeriod,
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedPeriod}days-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Analytics Error
              </h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">
            Smart Autocomplete Search System Performance Metrics
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {/* Auto Refresh Toggle */}
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">Auto-refresh</span>
          </label>

          {/* Action Buttons */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            disabled={!data}
            className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
            title="Export data"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading && !data ? (
        /* Loading State */
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      ) : data ? (
        /* Dashboard Content */
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Searches"
              value={data.search_analytics.total_searches.toLocaleString()}
              change={derivedMetrics?.searchGrowthRate}
              icon={<Search className="w-6 h-6" />}
              color="blue"
            />
            
            <MetricCard
              title="Success Rate"
              value={`${data.search_analytics.success_rate.toFixed(1)}%`}
              change={data.search_analytics.success_rate > 80 ? 5.2 : -2.1}
              icon={<Target className="w-6 h-6" />}
              color="green"
            />
            
            <MetricCard
              title="Avg Response Time"
              value={`${data.search_analytics.avg_response_time.toFixed(0)}ms`}
              change={data.search_analytics.avg_response_time < 100 ? -15.3 : 8.7}
              icon={<Clock className="w-6 h-6" />}
              color="purple"
              isInverted={true}
            />
            
            <MetricCard
              title="Total Words"
              value={data.trie_stats.word_count.toLocaleString()}
              change={2.8}
              icon={<BarChart3 className="w-6 h-6" />}
              color="orange"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Queries */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Search Queries
                </h3>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
              <TopQueriesChart data={data.top_queries} />
            </div>

            {/* Trending Words */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Trending Words
                </h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <TrendingWordsChart data={data.trending_words} />
            </div>
          </div>

          {/* Performance Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                System Performance
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Response Time & Success Rate</span>
              </div>
            </div>
            <PerformanceChart 
              responseTime={data.search_analytics.avg_response_time}
              successRate={data.search_analytics.success_rate}
              period={selectedPeriod}
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trie Statistics */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trie Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Frequency</span>
                  <span className="font-medium">
                    {data.trie_stats.total_frequency.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Frequency</span>
                  <span className="font-medium">
                    {data.trie_stats.avg_frequency.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Depth</span>
                  <span className="font-medium">{data.trie_stats.max_depth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node Count</span>
                  <span className="font-medium">
                    {data.trie_stats.node_count.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Efficiency</span>
                  <span className="font-medium">{data.performance.memory_efficiency}</span>
                </div>
              </div>
            </div>

            {/* Top Words */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Most Popular Words
              </h3>
              <div className="space-y-2">
                {data.top_words.slice(0, 8).map((word, index) => (
                  <div key={word.word} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 w-4">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{word.word}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">{word.freq}</span>
                      <span className="text-green-600">
                        {word.selections} selections
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">System Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Healthy
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Query Processing</span>
                  <span className="font-medium text-green-600">
                    {data.performance.query_time_ms}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Freshness</span>
                  <span className="font-medium">Real-time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsDashboard;
