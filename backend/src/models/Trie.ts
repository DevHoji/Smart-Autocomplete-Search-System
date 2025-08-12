/**
 * Trie (Prefix Tree) Implementation for Smart Autocomplete Search System
 * 
 * This is the core data structure that enables fast prefix-based autocomplete.
 * The Trie stores words with their frequencies and supports efficient:
 * - Insert: O(L) where L is the length of the word
 * - Search: O(L) for exact match, O(P) for prefix traversal
 * - TopK: O(P + S) where P is prefix length, S is nodes explored in subtree
 * - Delete: O(L) for word removal
 * 
 * Key Design Decisions:
 * 1. Each node stores a Map<string, TrieNode> for children (supports Unicode)
 * 2. Terminal nodes store the complete word for easy retrieval
 * 3. Frequency is stored at terminal nodes for ranking
 * 4. Metadata support for extensibility (categories, synonyms, etc.)
 */

import { TrieNode, TrieSuggestion } from '@/types';

/**
 * Internal TrieNode implementation
 * Uses Map for children to support Unicode characters efficiently
 */
class TrieNodeImpl implements TrieNode {
  public children: Map<string, TrieNode>;
  public isEndOfWord: boolean;
  public word?: string;
  public freq: number;
  public metadata?: Record<string, any>;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.freq = 0;
  }
}

/**
 * Min-Heap implementation for efficient topK extraction
 * Maintains the K highest frequency words during DFS traversal
 */
class MinHeap {
  private heap: TrieSuggestion[];
  private maxSize: number;

  constructor(maxSize: number) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  /**
   * Add suggestion to heap, maintaining size constraint
   * Time Complexity: O(log K)
   */
  public add(suggestion: TrieSuggestion): void {
    if (this.heap.length < this.maxSize) {
      this.heap.push(suggestion);
      this.heapifyUp(this.heap.length - 1);
    } else if (suggestion.freq > this.heap[0]!.freq) {
      // Replace minimum element if new suggestion has higher frequency
      this.heap[0] = suggestion;
      this.heapifyDown(0);
    }
  }

  /**
   * Get all suggestions sorted by frequency (descending)
   * Time Complexity: O(K log K)
   */
  public getSorted(): TrieSuggestion[] {
    return this.heap.sort((a, b) => b.freq - a.freq);
  }

  private heapifyUp(index: number): void {
    if (index === 0) return;
    
    const parentIndex = Math.floor((index - 1) / 2);
    if (this.heap[index]!.freq < this.heap[parentIndex]!.freq) {
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex]!, this.heap[index]!];
      this.heapifyUp(parentIndex);
    }
  }

  private heapifyDown(index: number): void {
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;
    let smallest = index;

    if (leftChild < this.heap.length && this.heap[leftChild]!.freq < this.heap[smallest]!.freq) {
      smallest = leftChild;
    }

    if (rightChild < this.heap.length && this.heap[rightChild]!.freq < this.heap[smallest]!.freq) {
      smallest = rightChild;
    }

    if (smallest !== index) {
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest]!, this.heap[index]!];
      this.heapifyDown(smallest);
    }
  }
}

/**
 * Main Trie class implementing the prefix tree data structure
 */
export class Trie {
  private root: TrieNode;
  private wordCount: number;
  private totalFrequency: number;

  constructor() {
    this.root = new TrieNodeImpl();
    this.wordCount = 0;
    this.totalFrequency = 0;
  }

  /**
   * Insert a word into the Trie with frequency and metadata
   * Time Complexity: O(L) where L is the length of the word
   * Space Complexity: O(L) in worst case (all new nodes)
   * 
   * @param word - The word to insert
   * @param freq - Frequency/weight of the word (default: 1)
   * @param metadata - Additional data (category, synonyms, etc.)
   */
  public insert(word: string, freq: number = 1, metadata?: Record<string, any>): void {
    if (!word || word.trim().length === 0) {
      throw new Error('Word cannot be empty');
    }

    const normalizedWord = word.toLowerCase().trim();
    let currentNode = this.root;

    // Traverse/create path for each character
    for (const char of normalizedWord) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new TrieNodeImpl());
      }
      currentNode = currentNode.children.get(char)!;
    }

    // Mark as end of word and store data
    const wasNewWord = !currentNode.isEndOfWord;
    currentNode.isEndOfWord = true;
    currentNode.word = normalizedWord;
    
    // Update frequency (add to existing or set new)
    const oldFreq = currentNode.freq;
    currentNode.freq = wasNewWord ? freq : currentNode.freq + freq;
    currentNode.metadata = { ...currentNode.metadata, ...metadata };

    // Update statistics
    if (wasNewWord) {
      this.wordCount++;
    }
    this.totalFrequency += (currentNode.freq - oldFreq);
  }

  /**
   * Search for exact word match
   * Time Complexity: O(L) where L is the length of the word
   * 
   * @param word - The word to search for
   * @returns TrieSuggestion if found, null otherwise
   */
  public searchExact(word: string): TrieSuggestion | null {
    const normalizedWord = word.toLowerCase().trim();
    const node = this.findNode(normalizedWord);
    
    if (node && node.isEndOfWord) {
      return {
        word: node.word!,
        freq: node.freq,
        category: node.metadata?.['category'],
        synonyms: node.metadata?.['synonyms'],
        metadata: node.metadata,
      };
    }
    
    return null;
  }

  /**
   * Get top K suggestions for a given prefix
   * Time Complexity: O(P + S) where P is prefix length, S is nodes explored
   * 
   * This is the core method for autocomplete functionality.
   * Uses DFS with a min-heap to efficiently find the K most frequent words.
   * 
   * @param prefix - The prefix to search for
   * @param k - Maximum number of suggestions to return
   * @param category - Optional category filter
   * @returns Array of TrieSuggestion sorted by frequency (descending)
   */
  public topK(prefix: string, k: number = 10, category?: string): TrieSuggestion[] {
    if (k <= 0) return [];
    
    const normalizedPrefix = prefix.toLowerCase().trim();
    
    // Find the node representing the prefix
    const prefixNode = this.findNode(normalizedPrefix);
    if (!prefixNode) {
      return []; // Prefix not found
    }

    // Use min-heap to maintain top K suggestions efficiently
    const heap = new MinHeap(k);
    
    // DFS from prefix node to collect suggestions
    this.dfsCollect(prefixNode, heap, category);
    
    return heap.getSorted();
  }

  /**
   * Delete a word from the Trie
   * Time Complexity: O(L) where L is the length of the word
   *
   * @param word - The word to delete
   * @returns true if word was deleted, false if not found
   */
  public delete(word: string): boolean {
    const normalizedWord = word.toLowerCase().trim();
    const result = this.deleteHelperWithResult(this.root, normalizedWord, 0);
    return result.deleted;
  }

  /**
   * Get all words with their frequencies
   * Time Complexity: O(N) where N is total number of nodes
   *
   * @returns Array of all words in the Trie
   */
  public getAllWords(): TrieSuggestion[] {
    const words: TrieSuggestion[] = [];
    this.dfsCollectAll(this.root, words);
    return words.sort((a, b) => b.freq - a.freq);
  }

  /**
   * Export Trie structure as JSON for backup/analysis
   * Time Complexity: O(N) where N is total number of nodes
   *
   * @returns JSON representation of the Trie
   */
  public toJSON(): any {
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      wordCount: this.wordCount,
      totalFrequency: this.totalFrequency,
      root: this.nodeToJSON(this.root),
    };
  }

  /**
   * Import Trie structure from JSON
   * Time Complexity: O(N) where N is total number of nodes
   *
   * @param data - JSON data to import
   */
  public fromJSON(data: any): void {
    if (!data.root) {
      throw new Error('Invalid Trie JSON data');
    }

    this.root = this.nodeFromJSON(data.root);
    this.wordCount = data.wordCount || 0;
    this.totalFrequency = data.totalFrequency || 0;
  }

  /**
   * Get Trie statistics
   *
   * @returns Object containing Trie statistics
   */
  public getStats(): {
    wordCount: number;
    totalFrequency: number;
    avgFrequency: number;
    maxDepth: number;
    nodeCount: number;
  } {
    const nodeCount = this.countNodes(this.root);
    const maxDepth = this.getMaxDepth(this.root, 0);

    return {
      wordCount: this.wordCount,
      totalFrequency: this.totalFrequency,
      avgFrequency: this.wordCount > 0 ? this.totalFrequency / this.wordCount : 0,
      maxDepth,
      nodeCount,
    };
  }

  /**
   * Update frequency of an existing word
   * Time Complexity: O(L) where L is the length of the word
   *
   * @param word - The word to update
   * @param newFreq - New frequency value
   * @returns true if updated, false if word not found
   */
  public updateFrequency(word: string, newFreq: number): boolean {
    const normalizedWord = word.toLowerCase().trim();
    const node = this.findNode(normalizedWord);

    if (node && node.isEndOfWord) {
      const oldFreq = node.freq;
      node.freq = newFreq;
      this.totalFrequency += (newFreq - oldFreq);
      return true;
    }

    return false;
  }

  /**
   * Increment frequency of an existing word (for learning)
   * Time Complexity: O(L) where L is the length of the word
   *
   * @param word - The word to increment
   * @param increment - Amount to increment (default: 1)
   * @returns new frequency if updated, -1 if word not found
   */
  public incrementFrequency(word: string, increment: number = 1): number {
    const normalizedWord = word.toLowerCase().trim();
    const node = this.findNode(normalizedWord);

    if (node && node.isEndOfWord) {
      node.freq += increment;
      this.totalFrequency += increment;
      return node.freq;
    }

    return -1;
  }

  // Private helper methods

  /**
   * Find node for a given word/prefix
   * Time Complexity: O(L) where L is the length of the word
   */
  private findNode(word: string): TrieNode | null {
    let currentNode = this.root;

    for (const char of word) {
      if (!currentNode.children.has(char)) {
        return null;
      }
      currentNode = currentNode.children.get(char)!;
    }

    return currentNode;
  }

  /**
   * DFS helper for collecting top K suggestions
   * Explores the subtree and adds valid words to the heap
   */
  private dfsCollect(node: TrieNode, heap: MinHeap, category?: string): void {
    // If current node is end of word, consider it as a suggestion
    if (node.isEndOfWord && node.word) {
      // Apply category filter if specified
      if (!category || node.metadata?.['category'] === category) {
        heap.add({
          word: node.word,
          freq: node.freq,
          category: node.metadata?.['category'],
          synonyms: node.metadata?.['synonyms'],
          metadata: node.metadata,
        });
      }
    }

    // Recursively explore all children
    for (const childNode of node.children.values()) {
      this.dfsCollect(childNode, heap, category);
    }
  }

  /**
   * DFS helper for collecting all words
   */
  private dfsCollectAll(node: TrieNode, words: TrieSuggestion[]): void {
    if (node.isEndOfWord && node.word) {
      words.push({
        word: node.word,
        freq: node.freq,
        category: node.metadata?.['category'],
        synonyms: node.metadata?.['synonyms'],
        metadata: node.metadata,
      });
    }

    for (const childNode of node.children.values()) {
      this.dfsCollectAll(childNode, words);
    }
  }

  /**
   * Recursive helper for word deletion with result tracking
   * Returns object with deletion status and whether node should be deleted
   */
  private deleteHelperWithResult(node: TrieNode, word: string, index: number): { deleted: boolean; shouldDelete: boolean } {
    if (index === word.length) {
      // Reached end of word
      if (!node.isEndOfWord) {
        return { deleted: false, shouldDelete: false }; // Word doesn't exist
      }

      // Mark as not end of word
      node.isEndOfWord = false;
      this.totalFrequency -= node.freq;
      node.freq = 0;
      delete (node as any).word;
      this.wordCount--;

      // Return true if node has no children (can be deleted)
      return { deleted: true, shouldDelete: node.children.size === 0 };
    }

    const char = word[index]!;
    const childNode = node.children.get(char);

    if (!childNode) {
      return { deleted: false, shouldDelete: false }; // Word doesn't exist
    }

    const result = this.deleteHelperWithResult(childNode, word, index + 1);

    if (result.shouldDelete) {
      node.children.delete(char);
    }

    // Current node should be deleted if it's not end of word and has no children
    const shouldDelete = !node.isEndOfWord && node.children.size === 0;

    return { deleted: result.deleted, shouldDelete };
  }



  /**
   * Convert node to JSON representation
   */
  private nodeToJSON(node: TrieNode): any {
    const result: any = {
      isEndOfWord: node.isEndOfWord,
      freq: node.freq,
    };

    if (node.word) {
      result.word = node.word;
    }

    if (node.metadata) {
      result.metadata = node.metadata;
    }

    if (node.children.size > 0) {
      result.children = {};
      for (const [char, childNode] of node.children) {
        result.children[char] = this.nodeToJSON(childNode);
      }
    }

    return result;
  }

  /**
   * Create node from JSON representation
   */
  private nodeFromJSON(data: any): TrieNode {
    const node = new TrieNodeImpl();
    node.isEndOfWord = data.isEndOfWord || false;
    node.freq = data.freq || 0;
    node.word = data.word;
    node.metadata = data.metadata;

    if (data.children) {
      for (const [char, childData] of Object.entries(data.children)) {
        node.children.set(char, this.nodeFromJSON(childData));
      }
    }

    return node;
  }

  /**
   * Count total number of nodes in the Trie
   */
  private countNodes(node: TrieNode): number {
    let count = 1; // Count current node

    for (const childNode of node.children.values()) {
      count += this.countNodes(childNode);
    }

    return count;
  }

  /**
   * Get maximum depth of the Trie
   */
  private getMaxDepth(node: TrieNode, currentDepth: number): number {
    let maxDepth = currentDepth;

    for (const childNode of node.children.values()) {
      const childDepth = this.getMaxDepth(childNode, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }

    return maxDepth;
  }
}
