

import { Trie } from '../src/models/Trie';

describe('Trie', () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
  });

  describe('Basic Operations', () => {
    test('should create empty trie', () => {
      const stats = trie.getStats();
      expect(stats.wordCount).toBe(0);
      expect(stats.totalFrequency).toBe(0);
      expect(stats.avgFrequency).toBe(0);
    });

    test('should insert single word', () => {
      trie.insert('hello', 5);
      
      const stats = trie.getStats();
      expect(stats.wordCount).toBe(1);
      expect(stats.totalFrequency).toBe(5);
      expect(stats.avgFrequency).toBe(5);
    });

    test('should insert multiple words', () => {
      trie.insert('hello', 5);
      trie.insert('world', 3);
      trie.insert('help', 2);
      
      const stats = trie.getStats();
      expect(stats.wordCount).toBe(3);
      expect(stats.totalFrequency).toBe(10);
      expect(stats.avgFrequency).toBe(10/3);
    });

    test('should handle duplicate insertions', () => {
      trie.insert('hello', 5);
      trie.insert('hello', 3); 
      
      const result = trie.searchExact('hello');
      expect(result).not.toBeNull();
      expect(result!.freq).toBe(8);
      
      const stats = trie.getStats();
      expect(stats.wordCount).toBe(1);
      expect(stats.totalFrequency).toBe(8);
    });

    test('should normalize words to lowercase', () => {
      trie.insert('HELLO', 5);
      trie.insert('Hello', 3);
      
      const result = trie.searchExact('hello');
      expect(result).not.toBeNull();
      expect(result!.freq).toBe(8);
      
      const stats = trie.getStats();
      expect(stats.wordCount).toBe(1);
    });

    test('should handle empty and whitespace words', () => {
      expect(() => trie.insert('')).toThrow('Word cannot be empty');
      expect(() => trie.insert('   ')).toThrow('Word cannot be empty');
    });
  });

  describe('Search Operations', () => {
    beforeEach(() => {
      trie.insert('hello', 10);
      trie.insert('help', 8);
      trie.insert('helicopter', 5);
      trie.insert('world', 7);
      trie.insert('word', 6);
    });

    test('should find exact matches', () => {
      const result = trie.searchExact('hello');
      expect(result).not.toBeNull();
      expect(result!.word).toBe('hello');
      expect(result!.freq).toBe(10);
    });

    test('should return null for non-existent words', () => {
      const result = trie.searchExact('nonexistent');
      expect(result).toBeNull();
    });

    test('should return null for partial matches', () => {
      const result = trie.searchExact('hel');
      expect(result).toBeNull();
    });
  });

  describe('TopK Suggestions', () => {
    beforeEach(() => {
      trie.insert('hello', 10);
      trie.insert('help', 8);
      trie.insert('helicopter', 5);
      trie.insert('hero', 3);
      trie.insert('world', 7);
      trie.insert('word', 6);
    });

    test('should return top suggestions for prefix', () => {
      const suggestions = trie.topK('hel', 3);
      
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]!.word).toBe('hello');
      expect(suggestions[0]!.freq).toBe(10);
      expect(suggestions[1]!.word).toBe('help');
      expect(suggestions[1]!.freq).toBe(8);
      expect(suggestions[2]!.word).toBe('helicopter');
      expect(suggestions[2]!.freq).toBe(5);
    });

    test('should return all matches when k is larger than available', () => {
      const suggestions = trie.topK('hel', 10);
      expect(suggestions).toHaveLength(3); 
    });

    test('should return empty array for non-existent prefix', () => {
      const suggestions = trie.topK('xyz', 5);
      expect(suggestions).toHaveLength(0);
    });

    test('should handle k=0', () => {
      const suggestions = trie.topK('hel', 0);
      expect(suggestions).toHaveLength(0);
    });

    test('should handle empty prefix', () => {
      const suggestions = trie.topK('', 3);
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]!.word).toBe('hello');
      expect(suggestions[1]!.word).toBe('help');
      expect(suggestions[2]!.word).toBe('world');
    });
  });

  describe('Frequency Operations', () => {
    beforeEach(() => {
      trie.insert('hello', 10);
      trie.insert('help', 8);
    });

    test('should update frequency', () => {
      const updated = trie.updateFrequency('hello', 15);
      expect(updated).toBe(true);
      
      const result = trie.searchExact('hello');
      expect(result!.freq).toBe(15);
    });

    test('should return false for non-existent word update', () => {
      const updated = trie.updateFrequency('nonexistent', 15);
      expect(updated).toBe(false);
    });

    test('should increment frequency', () => {
      const newFreq = trie.incrementFrequency('hello', 5);
      expect(newFreq).toBe(15);
      
      const result = trie.searchExact('hello');
      expect(result!.freq).toBe(15);
    });

    test('should return -1 for non-existent word increment', () => {
      const newFreq = trie.incrementFrequency('nonexistent', 5);
      expect(newFreq).toBe(-1);
    });

    test('should increment by 1 by default', () => {
      const newFreq = trie.incrementFrequency('hello');
      expect(newFreq).toBe(11);
    });
  });

  describe('Delete Operations', () => {
    beforeEach(() => {
      trie.insert('hello', 10);
      trie.insert('help', 8);
      trie.insert('helicopter', 5);
    });

    test('should delete existing word', () => {
      const deleted = trie.delete('hello');
      expect(deleted).toBe(true);
      
      const result = trie.searchExact('hello');
      expect(result).toBeNull();
      
      const stats = trie.getStats();
      expect(stats.wordCount).toBe(2);
    });

    test('should return false for non-existent word', () => {
      const deleted = trie.delete('nonexistent');
      expect(deleted).toBe(false);
    });

    test('should not affect other words with same prefix', () => {
      trie.delete('help');
      
      const helloResult = trie.searchExact('hello');
      const helicopterResult = trie.searchExact('helicopter');
      
      expect(helloResult).not.toBeNull();
      expect(helicopterResult).not.toBeNull();
    });
  });

  describe('Metadata Support', () => {
    test('should store and retrieve metadata', () => {
      trie.insert('hello', 10, { 
        category: 'greeting',
        synonyms: ['hi', 'hey'],
        custom: 'data'
      });
      
      const result = trie.searchExact('hello');
      expect(result!.category).toBe('greeting');
      expect(result!.synonyms).toEqual(['hi', 'hey']);
      expect(result!.metadata!['custom']).toBe('data');
    });

    test('should filter by category in topK', () => {
      trie.insert('hello', 10, { category: 'greeting' });
      trie.insert('help', 8, { category: 'action' });
      trie.insert('hero', 6, { category: 'person' });
      
      const suggestions = trie.topK('he', 5, 'greeting');
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]!.word).toBe('hello');
    });
  });

  describe('JSON Serialization', () => {
    beforeEach(() => {
      trie.insert('hello', 10, { category: 'greeting' });
      trie.insert('help', 8);
      trie.insert('world', 5);
    });

    test('should export to JSON', () => {
      const json = trie.toJSON();
      
      expect(json.version).toBe('1.0');
      expect(json.wordCount).toBe(3);
      expect(json.totalFrequency).toBe(23);
      expect(json.root).toBeDefined();
    });

    test('should import from JSON', () => {
      const json = trie.toJSON();
      const newTrie = new Trie();
      newTrie.fromJSON(json);
      
      const stats = newTrie.getStats();
      expect(stats.wordCount).toBe(3);
      expect(stats.totalFrequency).toBe(23);
      
      const result = newTrie.searchExact('hello');
      expect(result!.freq).toBe(10);
      expect(result!.category).toBe('greeting');
    });

    test('should handle invalid JSON', () => {
      const newTrie = new Trie();
      expect(() => newTrie.fromJSON({})).toThrow('Invalid Trie JSON data');
    });
  });

  describe('Statistics', () => {
    test('should calculate correct statistics', () => {
      trie.insert('a', 1);
      trie.insert('ab', 2);
      trie.insert('abc', 3);
      trie.insert('xyz', 4);
      
      const stats = trie.getStats();
      expect(stats.wordCount).toBe(4);
      expect(stats.totalFrequency).toBe(10);
      expect(stats.avgFrequency).toBe(2.5);
      expect(stats.maxDepth).toBe(3); 
      expect(stats.nodeCount).toBeGreaterThan(4); 
    });
  });

  describe('Edge Cases', () => {
    test('should handle Unicode characters', () => {
      trie.insert('café', 5);
      trie.insert('naïve', 3);
      trie.insert('résumé', 2);
      
      const result = trie.searchExact('café');
      expect(result).not.toBeNull();
      expect(result!.word).toBe('café');
    });

    test('should handle very long words', () => {
      const longWord = 'a'.repeat(1000);
      trie.insert(longWord, 1);
      
      const result = trie.searchExact(longWord);
      expect(result).not.toBeNull();
      expect(result!.word).toBe(longWord);
    });

    test('should handle single character words', () => {
      trie.insert('a', 5);
      trie.insert('i', 3);
      
      const suggestions = trie.topK('a', 5);
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]!.word).toBe('a');
    });
  });
});
