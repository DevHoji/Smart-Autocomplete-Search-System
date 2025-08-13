/**
 * Context Analysis Service
 * Provides sentence context analysis and next-word prediction
 */

export interface ContextAnalysis {
  sentenceType: 'question' | 'statement' | 'command' | 'exclamation';
  tense: 'past' | 'present' | 'future' | 'unknown';
  subject: string | null;
  lastWord: string | null;
  contextWords: string[];
  predictedNextWords: string[];
  confidence: number;
}

export class ContextAnalysisService {
  // Common word patterns for context prediction
  private readonly contextPatterns: Record<string, string[]> = {
    // Question words
    'what': ['is', 'are', 'was', 'were', 'do', 'does', 'did', 'will', 'would', 'can', 'could'],
    'where': ['is', 'are', 'was', 'were', 'do', 'does', 'did', 'will', 'would', 'can', 'could'],
    'when': ['is', 'are', 'was', 'were', 'do', 'does', 'did', 'will', 'would', 'can', 'could'],
    'why': ['is', 'are', 'was', 'were', 'do', 'does', 'did', 'will', 'would', 'can', 'could'],
    'how': ['is', 'are', 'was', 'were', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'much', 'many'],
    'who': ['is', 'are', 'was', 'were', 'will', 'would', 'can', 'could'],

    // Pronouns
    'i': ['am', 'was', 'will', 'have', 'had', 'can', 'could', 'would', 'should', 'might', 'must'],
    'you': ['are', 'were', 'will', 'have', 'had', 'can', 'could', 'would', 'should', 'might', 'must'],
    'he': ['is', 'was', 'will', 'has', 'had', 'can', 'could', 'would', 'should', 'might', 'must'],
    'she': ['is', 'was', 'will', 'has', 'had', 'can', 'could', 'would', 'should', 'might', 'must'],
    'it': ['is', 'was', 'will', 'has', 'had', 'can', 'could', 'would', 'should', 'might', 'must'],
    'we': ['are', 'were', 'will', 'have', 'had', 'can', 'could', 'would', 'should', 'might', 'must'],
    'they': ['are', 'were', 'will', 'have', 'had', 'can', 'could', 'would', 'should', 'might', 'must'],

    // Articles and determiners
    'the': ['best', 'most', 'first', 'last', 'only', 'main', 'next', 'previous', 'same', 'other'],
    'a': ['good', 'bad', 'new', 'old', 'big', 'small', 'great', 'little', 'long', 'short'],
    'an': ['amazing', 'awesome', 'excellent', 'outstanding', 'incredible', 'interesting', 'important'],

    // Verbs
    'is': ['a', 'an', 'the', 'not', 'very', 'really', 'quite', 'so', 'too', 'being'],
    'are': ['you', 'we', 'they', 'not', 'very', 'really', 'quite', 'so', 'too', 'being'],
    'was': ['a', 'an', 'the', 'not', 'very', 'really', 'quite', 'so', 'too', 'being'],
    'were': ['you', 'we', 'they', 'not', 'very', 'really', 'quite', 'so', 'too', 'being'],
    'will': ['be', 'have', 'do', 'go', 'come', 'see', 'get', 'make', 'take', 'give'],
    'would': ['be', 'have', 'do', 'go', 'come', 'see', 'get', 'make', 'take', 'give'],
    'can': ['be', 'have', 'do', 'go', 'come', 'see', 'get', 'make', 'take', 'give'],
    'could': ['be', 'have', 'do', 'go', 'come', 'see', 'get', 'make', 'take', 'give'],

    // Prepositions
    'to': ['be', 'go', 'do', 'see', 'get', 'make', 'take', 'give', 'come', 'work'],
    'in': ['the', 'a', 'an', 'this', 'that', 'my', 'your', 'his', 'her', 'our'],
    'on': ['the', 'a', 'an', 'this', 'that', 'my', 'your', 'his', 'her', 'our'],
    'at': ['the', 'a', 'an', 'this', 'that', 'my', 'your', 'his', 'her', 'our'],
    'for': ['the', 'a', 'an', 'this', 'that', 'my', 'your', 'his', 'her', 'our'],
    'with': ['the', 'a', 'an', 'this', 'that', 'my', 'your', 'his', 'her', 'our'],

    // Common phrases
    'going': ['to', 'home', 'there', 'back', 'away', 'out', 'up', 'down'],
    'looking': ['for', 'at', 'forward', 'back', 'up', 'down', 'around'],
    'thinking': ['about', 'of', 'that', 'how', 'why', 'when', 'where'],
    'talking': ['about', 'to', 'with', 'on', 'over'],
    'working': ['on', 'with', 'for', 'at', 'in', 'hard'],
  };

  // Common sentence starters and their typical continuations
  private readonly sentenceStarters: Record<string, string[]> = {
    'i think': ['that', 'about', 'we', 'you', 'it', 'this'],
    'i believe': ['that', 'in', 'we', 'you', 'it', 'this'],
    'i know': ['that', 'about', 'how', 'why', 'when', 'where'],
    'i feel': ['like', 'that', 'good', 'bad', 'happy', 'sad'],
    'i want': ['to', 'you', 'this', 'that', 'more', 'less'],
    'i need': ['to', 'you', 'this', 'that', 'more', 'help'],
    'i have': ['a', 'an', 'the', 'to', 'been', 'never'],
    'i am': ['a', 'an', 'the', 'not', 'very', 'really'],
    'there is': ['a', 'an', 'the', 'no', 'nothing', 'something'],
    'there are': ['many', 'few', 'some', 'no', 'several'],
    'it is': ['a', 'an', 'the', 'not', 'very', 'really'],
    'this is': ['a', 'an', 'the', 'not', 'very', 'really'],
    'that is': ['a', 'an', 'the', 'not', 'very', 'really'],
  };

  /**
   * Analyze sentence context and predict next words
   */
  analyzeContext(text: string, caretPosition: number): ContextAnalysis {
    const beforeCaret = text.slice(0, caretPosition).trim().toLowerCase();
    const words = beforeCaret.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) {
      return {
        sentenceType: 'statement',
        tense: 'unknown',
        subject: null,
        lastWord: null,
        contextWords: [],
        predictedNextWords: [],
        confidence: 0,
      };
    }

    const lastWord = words[words.length - 1];
    const sentenceType = this.detectSentenceType(beforeCaret);
    const tense = this.detectTense(words);
    const subject = this.detectSubject(words);
    const predictedNextWords = this.predictNextWords(words, beforeCaret);

    return {
      sentenceType,
      tense,
      subject,
      lastWord,
      contextWords: words,
      predictedNextWords,
      confidence: this.calculateConfidence(words, predictedNextWords),
    };
  }

  /**
   * Detect sentence type based on structure and keywords
   */
  private detectSentenceType(text: string): ContextAnalysis['sentenceType'] {
    const questionWords = ['what', 'where', 'when', 'why', 'how', 'who', 'which', 'whose'];
    const firstWord = text.split(/\s+/)[0]?.toLowerCase();

    if (text.includes('?') || questionWords.includes(firstWord)) {
      return 'question';
    }

    if (text.includes('!')) {
      return 'exclamation';
    }

    // Check for imperative mood (commands)
    const imperativeStarters = ['please', 'let', 'make', 'do', 'don\'t', 'stop', 'start', 'go', 'come'];
    if (imperativeStarters.includes(firstWord)) {
      return 'command';
    }

    return 'statement';
  }

  /**
   * Detect tense based on verb forms and auxiliary verbs
   */
  private detectTense(words: string[]): ContextAnalysis['tense'] {
    const pastIndicators = ['was', 'were', 'had', 'did', 'went', 'came', 'saw', 'made'];
    const presentIndicators = ['is', 'are', 'am', 'do', 'does', 'have', 'has'];
    const futureIndicators = ['will', 'shall', 'going to', 'gonna'];

    const text = words.join(' ');

    if (futureIndicators.some(indicator => text.includes(indicator))) {
      return 'future';
    }

    if (pastIndicators.some(indicator => words.includes(indicator))) {
      return 'past';
    }

    if (presentIndicators.some(indicator => words.includes(indicator))) {
      return 'present';
    }

    // Check for past tense verb endings
    const lastWord = words[words.length - 1];
    if (lastWord && (lastWord.endsWith('ed') || lastWord.endsWith('d'))) {
      return 'past';
    }

    return 'unknown';
  }

  /**
   * Detect the subject of the sentence
   */
  private detectSubject(words: string[]): string | null {
    const pronouns = ['i', 'you', 'he', 'she', 'it', 'we', 'they'];
    
    for (const word of words) {
      if (pronouns.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
    }

    // Look for potential noun subjects (simplified)
    if (words.length > 0) {
      const firstWord = words[0].toLowerCase();
      if (!['the', 'a', 'an', 'this', 'that', 'my', 'your', 'his', 'her', 'our', 'their'].includes(firstWord)) {
        return firstWord;
      }
    }

    return null;
  }

  /**
   * Predict next words based on context patterns
   */
  private predictNextWords(words: string[], fullText: string): string[] {
    if (words.length === 0) {
      return ['i', 'the', 'a', 'this', 'that', 'what', 'how', 'why'];
    }

    const lastWord = words[words.length - 1];
    const predictions: string[] = [];

    // Check single word patterns
    if (this.contextPatterns[lastWord]) {
      predictions.push(...this.contextPatterns[lastWord]);
    }

    // Check phrase patterns
    for (const [phrase, continuations] of Object.entries(this.sentenceStarters)) {
      if (fullText.includes(phrase)) {
        predictions.push(...continuations);
      }
    }

    // Check two-word patterns
    if (words.length >= 2) {
      const lastTwoWords = words.slice(-2).join(' ');
      if (this.sentenceStarters[lastTwoWords]) {
        predictions.push(...this.sentenceStarters[lastTwoWords]);
      }
    }

    // Remove duplicates and return top predictions
    return Array.from(new Set(predictions)).slice(0, 10);
  }

  /**
   * Calculate confidence score for predictions
   */
  private calculateConfidence(words: string[], predictions: string[]): number {
    if (predictions.length === 0) {
      return 0;
    }

    let confidence = 0.5; // Base confidence

    // Increase confidence based on context length
    if (words.length >= 3) {
      confidence += 0.2;
    }

    // Increase confidence if we have many predictions
    if (predictions.length >= 5) {
      confidence += 0.2;
    }

    // Increase confidence for common patterns
    const lastWord = words[words.length - 1];
    if (this.contextPatterns[lastWord]) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Get contextual suggestions for a partial word
   */
  getContextualSuggestions(
    context: string,
    partialWord: string,
    allSuggestions: string[]
  ): string[] {
    const analysis = this.analyzeContext(context, context.length);
    const predictions = analysis.predictedNextWords;

    // Filter suggestions that match predictions
    const contextualSuggestions = allSuggestions.filter(suggestion =>
      predictions.some(prediction => 
        suggestion.toLowerCase().startsWith(prediction.toLowerCase()) ||
        prediction.toLowerCase().startsWith(suggestion.toLowerCase())
      )
    );

    // Combine contextual suggestions with regular suggestions
    const regularSuggestions = allSuggestions.filter(s => 
      !contextualSuggestions.includes(s)
    );

    return [
      ...contextualSuggestions.slice(0, 5),
      ...regularSuggestions.slice(0, 5)
    ].slice(0, 10);
  }
}

// Export singleton instance
export const contextAnalysisService = new ContextAnalysisService();
