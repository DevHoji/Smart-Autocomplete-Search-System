import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  BarChart3, 
  Settings as SettingsIcon,
  Database,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiService } from '../services/api';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics?: any;
}

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  format: 'json' | 'csv' | 'txt';
  size: string;
  available: boolean;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, analytics }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const exportOptions: ExportOption[] = [
    {
      id: 'analytics',
      name: 'Analytics Data',
      description: 'Search statistics, top queries, and performance metrics',
      icon: <BarChart3 className="w-5 h-5" />,
      format: 'json',
      size: '~2.5 KB',
      available: !!analytics
    },
    {
      id: 'search-history',
      name: 'Search History',
      description: 'Your recent search queries and selections',
      icon: <FileText className="w-5 h-5" />,
      format: 'csv',
      size: '~1.2 KB',
      available: true
    },
    {
      id: 'word-database',
      name: 'Word Database',
      description: 'Complete word list with frequencies and categories',
      icon: <Database className="w-5 h-5" />,
      format: 'json',
      size: '~45 KB',
      available: true
    },
    {
      id: 'settings',
      name: 'Settings Backup',
      description: 'Your current application preferences and settings',
      icon: <SettingsIcon className="w-5 h-5" />,
      format: 'json',
      size: '~0.8 KB',
      available: true
    },
    {
      id: 'system-info',
      name: 'System Information',
      description: 'Trie statistics and system performance data',
      icon: <Database className="w-5 h-5" />,
      format: 'txt',
      size: '~1.5 KB',
      available: true
    }
  ];

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const selectAll = () => {
    const availableOptions = exportOptions.filter(opt => opt.available).map(opt => opt.id);
    setSelectedOptions(availableOptions);
  };

  const clearAll = () => {
    setSelectedOptions([]);
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAnalytics = () => {
    if (!analytics) return null;
    
    const exportData = {
      exported_at: new Date().toISOString(),
      export_type: 'analytics',
      data: {
        ...analytics,
        export_metadata: {
          version: '1.0',
          source: 'Smart Autocomplete Search',
          format: 'json'
        }
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const exportSearchHistory = async () => {
    // In a real app, this would fetch from localStorage or API
    const mockHistory = [
      { query: 'computer', timestamp: new Date().toISOString(), selected: 'computer' },
      { query: 'tech', timestamp: new Date().toISOString(), selected: 'technology' },
      { query: 'comp', timestamp: new Date().toISOString(), selected: 'computer' }
    ];
    
    const csvHeader = 'Query,Timestamp,Selected,Success\n';
    const csvRows = mockHistory.map(item => 
      `"${item.query}","${item.timestamp}","${item.selected}","${item.selected ? 'true' : 'false'}"`
    ).join('\n');
    
    return csvHeader + csvRows;
  };

  const exportWordDatabase = async () => {
    try {
      // This would typically fetch from an API endpoint
      const response = await fetch('/api/words/export');
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error('Failed to fetch word database:', error);
    }
    
    // Fallback mock data
    return JSON.stringify({
      exported_at: new Date().toISOString(),
      export_type: 'word_database',
      total_words: analytics?.trie_stats?.word_count || 0,
      note: 'This is a sample export. In production, this would contain the full word database.',
      sample_words: [
        { word: 'computer', freq: 95, category: 'technology' },
        { word: 'technology', freq: 63, category: 'science' }
      ]
    }, null, 2);
  };

  const exportSettings = () => {
    const settings = {
      exported_at: new Date().toISOString(),
      export_type: 'settings',
      settings: {
        theme: 'dark',
        animations: true,
        voice_enabled: true,
        max_suggestions: 10,
        auto_complete: true,
        fuzzy_search: true
      }
    };
    
    return JSON.stringify(settings, null, 2);
  };

  const exportSystemInfo = () => {
    const systemInfo = `Smart Autocomplete Search - System Information
Generated: ${new Date().toLocaleString()}

=== Trie Statistics ===
Word Count: ${analytics?.trie_stats?.word_count || 'N/A'}
Total Frequency: ${analytics?.trie_stats?.total_frequency || 'N/A'}
Average Frequency: ${analytics?.trie_stats?.avg_frequency?.toFixed(2) || 'N/A'}
Max Depth: ${analytics?.trie_stats?.max_depth || 'N/A'}
Node Count: ${analytics?.trie_stats?.node_count || 'N/A'}

=== Search Analytics ===
Total Searches: ${analytics?.search_analytics?.total_searches || 'N/A'}
Total Selections: ${analytics?.search_analytics?.total_selections || 'N/A'}
Success Rate: ${analytics?.search_analytics?.success_rate?.toFixed(1) || 'N/A'}%
Average Response Time: ${analytics?.search_analytics?.avg_response_time?.toFixed(2) || 'N/A'}ms

=== Performance ===
Memory Efficiency: ${analytics?.performance?.memory_efficiency || 'N/A'}
Query Time: ${analytics?.performance?.query_time_ms || 'N/A'}ms

=== System ===
Browser: ${navigator.userAgent}
Platform: ${navigator.platform}
Language: ${navigator.language}
Online: ${navigator.onLine ? 'Yes' : 'No'}
`;
    
    return systemInfo;
  };

  const handleExport = async () => {
    if (selectedOptions.length === 0) return;
    
    setIsExporting(true);
    setExportStatus('idle');
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      for (const optionId of selectedOptions) {
        const option = exportOptions.find(opt => opt.id === optionId);
        if (!option) continue;
        
        let content = '';
        let filename = '';
        let contentType = '';
        
        switch (optionId) {
          case 'analytics':
            content = exportAnalytics() || '';
            filename = `analytics-${timestamp}.json`;
            contentType = 'application/json';
            break;
          case 'search-history':
            content = await exportSearchHistory();
            filename = `search-history-${timestamp}.csv`;
            contentType = 'text/csv';
            break;
          case 'word-database':
            content = await exportWordDatabase();
            filename = `word-database-${timestamp}.json`;
            contentType = 'application/json';
            break;
          case 'settings':
            content = exportSettings();
            filename = `settings-${timestamp}.json`;
            contentType = 'application/json';
            break;
          case 'system-info':
            content = exportSystemInfo();
            filename = `system-info-${timestamp}.txt`;
            contentType = 'text/plain';
            break;
        }
        
        if (content) {
          downloadFile(content, filename, contentType);
        }
      }
      
      setExportStatus('success');
      setTimeout(() => {
        setExportStatus('idle');
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = () => {
    switch (exportStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (exportStatus) {
      case 'success':
        return 'Export completed successfully!';
      case 'error':
        return 'Export failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-glass border border-gray-700 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center pulse-glow">
              <Download className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold gradient-text">
                Export Data
              </h3>
              <p className="text-sm text-gray-400">
                Download your data in various formats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={selectAll}
                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {selectedOptions.length} of {exportOptions.filter(opt => opt.available).length} selected
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3 mb-6">
            {exportOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  option.available
                    ? selectedOptions.includes(option.id)
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    : 'border-gray-800 bg-gray-900/50 opacity-50'
                } ${option.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                onClick={() => option.available && toggleOption(option.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedOptions.includes(option.id) && option.available
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {option.icon}
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        option.available ? 'text-gray-200' : 'text-gray-500'
                      }`}>
                        {option.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 uppercase">
                      {option.format}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.size}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Message */}
          {exportStatus !== 'idle' && (
            <div className={`flex items-center space-x-2 mb-4 p-3 rounded-lg ${
              exportStatus === 'success' ? 'bg-green-500/10 border border-green-500/30' :
              exportStatus === 'error' ? 'bg-red-500/10 border border-red-500/30' : ''
            }`}>
              {getStatusIcon()}
              <span className={`text-sm ${
                exportStatus === 'success' ? 'text-green-400' :
                exportStatus === 'error' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {getStatusMessage()}
              </span>
            </div>
          )}

          {/* Export Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Files will be downloaded to your default download folder
            </div>
            <button
              onClick={handleExport}
              disabled={selectedOptions.length === 0 || isExporting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected ({selectedOptions.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
