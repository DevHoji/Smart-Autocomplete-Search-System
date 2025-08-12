/**
 * TypeScript type definitions for the Smart Autocomplete Search System frontend
 */

// API Response Types
export interface Suggestion {
  word: string;
  freq: number;
  category?: string;
  synonyms?: string[];
  metadata?: Record<string, unknown>;
}

export interface SuggestResponse {
  suggestions: Suggestion[];
  prefix: string;
  total: number;
  fuzzy: boolean;
}

export interface SelectRequest {
  word: string;
  prefix: string;
  user_id?: string;
}

export interface SelectResponse {
  success: boolean;
  newFreq: number;
  word: string;
  message: string;
  timestamp: string;
}

export interface InsertRequest {
  word: string;
  freq?: number;
  category?: string;
  synonyms?: string[];
  metadata?: Record<string, unknown>;
  user_id?: string;
}

export interface InsertResponse {
  success: boolean;
  word: string;
  message: string;
  data: {
    word: string;
    freq: number;
    category?: string;
    synonyms?: string[];
    metadata?: Record<string, unknown>;
  };
  timestamp: string;
}

// Analytics Types
export interface AnalyticsData {
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
  search_analytics: {
    total_searches: number;
    total_selections: number;
    success_rate: number;
    avg_response_time: number;
  };
  top_queries: Array<{
    query: string;
    count: number;
  }>;
  top_words: Array<{
    word: string;
    freq: number;
    selections: number;
  }>;
  trending_words: Array<{
    word: string;
    recent_selections: number;
    growth_rate: number;
  }>;
  trie_stats: {
    word_count: number;
    total_frequency: number;
    avg_frequency: number;
    max_depth: number;
    node_count: number;
  };
  performance: {
    query_time_ms: number;
    memory_efficiency: string;
  };
  generated_at: string;
}

// UI State Types
export interface AutocompleteState {
  query: string;
  suggestions: Suggestion[];
  selectedIndex: number;
  isLoading: boolean;
  isOpen: boolean;
  error?: string;
}

export interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error?: string;
}

export interface TTSState {
  isSpeaking: boolean;
  isEnabled: boolean;
  isSupported: boolean;
  error?: string;
}

export interface OCRState {
  isProcessing: boolean;
  extractedText: string;
  confidence: number;
  error?: string;
}

export interface SettingsState {
  maxSuggestions: number;
  enableVoiceOutput: boolean;
  enableRealTimeUpdates: boolean;
  selectedCategory?: string;
  debounceMs: number;
}

// Socket.IO Event Types
export interface SocketEvents {
  'trie:update': (data: {
    type: 'insert' | 'update' | 'delete';
    word: string;
    freq?: number;
    timestamp: string;
  }) => void;
  'analytics:update': (data: {
    type: 'search' | 'selection';
    data: unknown;
  }) => void;
}

// Component Props Types
export interface AutocompleteProps {
  placeholder?: string;
  maxSuggestions?: number;
  category?: string;
  onSelect?: (suggestion: Suggestion) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

export interface SuggestionItemProps {
  suggestion: Suggestion;
  isSelected: boolean;
  onSelect: (suggestion: Suggestion) => void;
  highlightQuery: string;
}

export interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export interface ImageUploadProps {
  onTextExtracted: (text: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  isLoading?: boolean;
  error?: string;
}

// API Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  timestamp: string;
}

// Utility Types
export type Category = 
  | 'technology'
  | 'person'
  | 'action'
  | 'noun'
  | 'greeting'
  | 'communication'
  | 'media'
  | 'web'
  | 'work'
  | 'group';

export type SortOrder = 'asc' | 'desc';

export type ViewMode = 'grid' | 'list';

export interface FilterOptions {
  category?: Category;
  minFrequency?: number;
  maxResults?: number;
  sortBy?: 'frequency' | 'alphabetical' | 'recent';
  sortOrder?: SortOrder;
}

// Hook Return Types
export interface UseAutocompleteReturn {
  state: AutocompleteState;
  actions: {
    setQuery: (query: string) => void;
    selectSuggestion: (index: number) => void;
    clearSuggestions: () => void;
    nextSuggestion: () => void;
    previousSuggestion: () => void;
  };
}

export interface UseVoiceReturn {
  state: VoiceState;
  actions: {
    startListening: () => void;
    stopListening: () => void;
    clearTranscript: () => void;
  };
}

export interface UseTTSReturn {
  state: TTSState;
  actions: {
    speak: (text: string) => void;
    stop: () => void;
    toggle: () => void;
  };
}

export interface UseAnalyticsReturn {
  data?: AnalyticsData;
  isLoading: boolean;
  error?: string;
  refetch: () => Promise<void>;
}
