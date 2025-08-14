
export interface Word {
  id?: number;
  word: string;
  freq: number;
  category?: string;
  synonyms?: string[];
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
  last_selected?: Date;
}

export interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  word?: string | undefined;
  freq: number;
  metadata?: Record<string, any> | undefined;
}

export interface TrieSuggestion {
  word: string;
  freq: number;
  category?: string | undefined;
  synonyms?: string[] | undefined;
  metadata?: Record<string, any> | undefined;
}

export interface SuggestRequest {
  prefix: string;
  k?: number;
  category?: string;
}

export interface SuggestResponse {
  suggestions: TrieSuggestion[];
  prefix: string;
  total: number;
  fuzzy?: boolean;
}

export interface SelectRequest {
  word: string;
  prefix: string;
  user_id?: string;
}

export interface InsertRequest {
  word: string;
  freq?: number;
  category?: string;
  synonyms?: string[];
  metadata?: Record<string, any>;
  user_id?: string;
}

export interface SearchLog {
  id?: number;
  query_text: string;
  user_id?: string;
  result_count: number;
  selected_word_id?: number;
  created_at?: Date;
  response_time_ms?: number;
}

export interface AnalyticsStats {
  total_searches: number;
  total_selections: number;
  success_rate: number;
  avg_response_time: number;
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
}

export interface SocketEvents {
  'trie:update': (data: {
    type: 'insert' | 'update' | 'delete';
    word: string;
    freq?: number;
  }) => void;
  'analytics:update': (data: {
    type: 'search' | 'selection';
    data: any;
  }) => void;
}

export interface DatabaseConfig {
  connectionString: string;
  ssl?: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface FuzzyMatch {
  word: string;
  distance: number;
  freq: number;
}

export interface TrieExport {
  version: string;
  timestamp: Date;
  word_count: number;
  trie_data: any;
  metadata: {
    total_words: number;
    avg_frequency: number;
    categories: string[];
  };
}
