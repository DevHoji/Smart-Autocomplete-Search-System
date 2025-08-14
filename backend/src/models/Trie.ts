import { TrieNode, TrieSuggestion } from '@/types';
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

class MinHeap {
  private heap: TrieSuggestion[];
  private maxSize: number;

  constructor(maxSize: number) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  
  public add(suggestion: TrieSuggestion): void {
    if (this.heap.length < this.maxSize) {
      this.heap.push(suggestion);
      this.heapifyUp(this.heap.length - 1);
    } else if (suggestion.freq > this.heap[0]!.freq) {
      
      this.heap[0] = suggestion;
      this.heapifyDown(0);
    }
  }

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
   
   * 
   * @param word
   * @param freq 
   * @param metadata 
   */
  public insert(word: string, freq: number = 1, metadata?: Record<string, any>): void {
    if (!word || word.trim().length === 0) {
      throw new Error('Word cannot be empty');
    }

    const normalizedWord = word.toLowerCase().trim();
    let currentNode = this.root;

    
    for (const char of normalizedWord) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new TrieNodeImpl());
      }
      currentNode = currentNode.children.get(char)!;
    }

    
    const wasNewWord = !currentNode.isEndOfWord;
    currentNode.isEndOfWord = true;
    currentNode.word = normalizedWord;
    
    
    const oldFreq = currentNode.freq;
    currentNode.freq = wasNewWord ? freq : currentNode.freq + freq;
    currentNode.metadata = { ...currentNode.metadata, ...metadata };

    
    if (wasNewWord) {
      this.wordCount++;
    }
    this.totalFrequency += (currentNode.freq - oldFreq);
  }

  /**
   
   * 
   * @param word 
   * @returns 
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
   * 
   * @param prefix 
   * @param k 
   * @param category
   * @returns 
   */
  public topK(prefix: string, k: number = 10, category?: string): TrieSuggestion[] {
    if (k <= 0) return [];
    
    const normalizedPrefix = prefix.toLowerCase().trim();
    
   
    const prefixNode = this.findNode(normalizedPrefix);
    if (!prefixNode) {
      return []; 
    }

    
    const heap = new MinHeap(k);
    
    
    this.dfsCollect(prefixNode, heap, category);
    
    return heap.getSorted();
  }

  /**
   
   *
   * @param word 
   * @returns 
   */
  public delete(word: string): boolean {
    const normalizedWord = word.toLowerCase().trim();
    const result = this.deleteHelperWithResult(this.root, normalizedWord, 0);
    return result.deleted;
  }

  /**
   * 
   *
   * @returns 
   */
  public getAllWords(): TrieSuggestion[] {
    const words: TrieSuggestion[] = [];
    this.dfsCollectAll(this.root, words);
    return words.sort((a, b) => b.freq - a.freq);
  }

  /**
   
   *
   * @returns 
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
  
   *
   * @param data 
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
   
   * @param word 
   * @returns 
   */
  public getWordFrequency(word: string): number {
    let current = this.root;

    for (const char of word.toLowerCase()) {
      const child = current.children.get(char);
      if (!child) {
        return 0;
      }
      current = child;
    }

    return current.isEndOfWord ? (current.freq || 0) : 0;
  }

  /**
   
   * @returns 
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
  
   * @param word 
   * @param newFreq 
   * @returns 
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
  
   *
   * @param word 
   * @param increment 
   * @returns
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

 
  private dfsCollect(node: TrieNode, heap: MinHeap, category?: string): void {
    
    if (node.isEndOfWord && node.word) {
      
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

 
    for (const childNode of node.children.values()) {
      this.dfsCollect(childNode, heap, category);
    }
  }

  
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

  
  private deleteHelperWithResult(node: TrieNode, word: string, index: number): { deleted: boolean; shouldDelete: boolean } {
    if (index === word.length) {
      
      if (!node.isEndOfWord) {
        return { deleted: false, shouldDelete: false }; 
      }

      
      node.isEndOfWord = false;
      this.totalFrequency -= node.freq;
      node.freq = 0;
      delete (node as any).word;
      this.wordCount--;

      
      return { deleted: true, shouldDelete: node.children.size === 0 };
    }

    const char = word[index]!;
    const childNode = node.children.get(char);

    if (!childNode) {
      return { deleted: false, shouldDelete: false }; 
    }

    const result = this.deleteHelperWithResult(childNode, word, index + 1);

    if (result.shouldDelete) {
      node.children.delete(char);
    }

    
    const shouldDelete = !node.isEndOfWord && node.children.size === 0;

    return { deleted: result.deleted, shouldDelete };
  }



 
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


  private countNodes(node: TrieNode): number {
    let count = 1; 

    for (const childNode of node.children.values()) {
      count += this.countNodes(childNode);
    }

    return count;
  }

  
  private getMaxDepth(node: TrieNode, currentDepth: number): number {
    let maxDepth = currentDepth;

    for (const childNode of node.children.values()) {
      const childDepth = this.getMaxDepth(childNode, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }

    return maxDepth;
  }
}
