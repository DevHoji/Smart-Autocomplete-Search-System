

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env['DATABASE_URL'],
  ssl: process.env['NODE_ENV'] === 'production' ? { rejectUnauthorized: false } : false,
});

const generateMeaningfulWord = (category: string, index: number): string => {
  const categoryWords: Record<string, string[]> = {
    communication: ['message', 'phone', 'email', 'chat', 'talk', 'speak', 'voice', 'text', 'call', 'letter', 'mail', 'post', 'send', 'receive', 'reply', 'answer', 'question', 'ask', 'tell', 'say'],
    media: ['television', 'radio', 'newspaper', 'magazine', 'book', 'movie', 'film', 'video', 'audio', 'image', 'photo', 'picture', 'camera', 'recording', 'broadcast', 'channel', 'program', 'show', 'news', 'story'],
    entertainment: ['game', 'fun', 'party', 'celebration', 'festival', 'concert', 'theater', 'comedy', 'drama', 'music', 'dance', 'sing', 'laugh', 'smile', 'joy', 'happy', 'enjoy', 'pleasure', 'hobby', 'interest'],
    science: ['research', 'experiment', 'theory', 'hypothesis', 'discovery', 'invention', 'laboratory', 'scientist', 'chemistry', 'physics', 'biology', 'astronomy', 'geology', 'ecology', 'genetics', 'molecule', 'atom', 'element', 'compound', 'reaction'],
    mathematics: ['number', 'calculate', 'equation', 'formula', 'algebra', 'geometry', 'statistics', 'probability', 'addition', 'subtraction', 'multiplication', 'division', 'fraction', 'decimal', 'percentage', 'ratio', 'proportion', 'graph', 'chart', 'data'],
    geography: ['continent', 'country', 'state', 'province', 'city', 'capital', 'population', 'border', 'coast', 'island', 'peninsula', 'mountain', 'river', 'lake', 'desert', 'forest', 'climate', 'weather', 'temperature', 'rainfall'],
    history: ['ancient', 'medieval', 'modern', 'century', 'decade', 'year', 'date', 'event', 'war', 'peace', 'revolution', 'empire', 'kingdom', 'democracy', 'republic', 'civilization', 'culture', 'tradition', 'heritage', 'monument'],
    literature: ['novel', 'story', 'poem', 'poetry', 'author', 'writer', 'character', 'plot', 'theme', 'setting', 'dialogue', 'narrative', 'fiction', 'nonfiction', 'biography', 'autobiography', 'essay', 'article', 'review', 'criticism'],
    art: ['painting', 'drawing', 'sculpture', 'artist', 'canvas', 'brush', 'color', 'palette', 'gallery', 'museum', 'exhibition', 'masterpiece', 'portrait', 'landscape', 'abstract', 'realistic', 'style', 'technique', 'creativity', 'inspiration'],
    music: ['song', 'melody', 'rhythm', 'harmony', 'instrument', 'piano', 'guitar', 'violin', 'drum', 'singer', 'musician', 'composer', 'orchestra', 'band', 'concert', 'performance', 'album', 'recording', 'studio', 'sound'],
    fashion: ['clothing', 'dress', 'shirt', 'pants', 'shoes', 'hat', 'jacket', 'style', 'design', 'fabric', 'color', 'pattern', 'trend', 'model', 'designer', 'boutique', 'store', 'shopping', 'wardrobe', 'accessory'],
    beauty: ['beautiful', 'pretty', 'attractive', 'gorgeous', 'stunning', 'elegant', 'graceful', 'charming', 'lovely', 'handsome', 'makeup', 'cosmetics', 'skincare', 'haircare', 'salon', 'spa', 'treatment', 'massage', 'relaxation', 'wellness'],
    home: ['house', 'apartment', 'room', 'bedroom', 'kitchen', 'bathroom', 'living', 'dining', 'furniture', 'table', 'chair', 'bed', 'sofa', 'cabinet', 'shelf', 'window', 'door', 'wall', 'floor', 'ceiling'],
    family: ['parent', 'mother', 'father', 'child', 'son', 'daughter', 'brother', 'sister', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin', 'nephew', 'niece', 'husband', 'wife', 'marriage', 'wedding', 'love'],
    relationship: ['friend', 'friendship', 'partner', 'relationship', 'dating', 'romance', 'love', 'affection', 'care', 'trust', 'loyalty', 'support', 'understanding', 'communication', 'respect', 'honesty', 'commitment', 'intimacy', 'bond', 'connection'],
    emotion: ['happy', 'sad', 'angry', 'excited', 'nervous', 'calm', 'peaceful', 'worried', 'anxious', 'confident', 'proud', 'ashamed', 'guilty', 'jealous', 'envious', 'grateful', 'thankful', 'hopeful', 'disappointed', 'surprised'],
    personality: ['kind', 'generous', 'selfish', 'honest', 'dishonest', 'brave', 'coward', 'intelligent', 'stupid', 'wise', 'foolish', 'patient', 'impatient', 'polite', 'rude', 'friendly', 'unfriendly', 'outgoing', 'shy', 'confident'],
    behavior: ['action', 'behavior', 'conduct', 'manner', 'attitude', 'approach', 'response', 'reaction', 'decision', 'choice', 'habit', 'routine', 'custom', 'practice', 'tradition', 'rule', 'law', 'regulation', 'policy', 'procedure'],
    social: ['society', 'community', 'group', 'organization', 'association', 'club', 'team', 'member', 'leader', 'follower', 'cooperation', 'collaboration', 'competition', 'conflict', 'agreement', 'disagreement', 'negotiation', 'compromise', 'solution', 'problem'],
    culture: ['culture', 'tradition', 'custom', 'ritual', 'ceremony', 'festival', 'celebration', 'holiday', 'language', 'dialect', 'accent', 'literature', 'art', 'music', 'dance', 'food', 'cuisine', 'recipe', 'ingredient', 'flavor'],
    religion: ['religion', 'faith', 'belief', 'god', 'prayer', 'worship', 'church', 'temple', 'mosque', 'synagogue', 'priest', 'minister', 'rabbi', 'imam', 'bible', 'quran', 'torah', 'scripture', 'holy', 'sacred'],
    philosophy: ['philosophy', 'wisdom', 'knowledge', 'truth', 'reality', 'existence', 'meaning', 'purpose', 'ethics', 'morality', 'right', 'wrong', 'good', 'evil', 'justice', 'fairness', 'freedom', 'responsibility', 'consciousness', 'mind'],
    politics: ['government', 'politics', 'politician', 'president', 'minister', 'senator', 'representative', 'election', 'vote', 'democracy', 'republic', 'monarchy', 'dictatorship', 'party', 'campaign', 'policy', 'law', 'constitution', 'citizen', 'rights'],
    law: ['law', 'legal', 'court', 'judge', 'lawyer', 'attorney', 'case', 'trial', 'evidence', 'witness', 'jury', 'verdict', 'sentence', 'punishment', 'fine', 'prison', 'jail', 'crime', 'criminal', 'victim'],
    military: ['army', 'navy', 'airforce', 'soldier', 'officer', 'general', 'captain', 'sergeant', 'private', 'war', 'battle', 'fight', 'weapon', 'gun', 'rifle', 'tank', 'ship', 'plane', 'helicopter', 'missile'],
    transportation: ['car', 'bus', 'train', 'plane', 'ship', 'boat', 'bicycle', 'motorcycle', 'truck', 'taxi', 'subway', 'metro', 'station', 'airport', 'port', 'highway', 'road', 'street', 'bridge', 'tunnel'],
    construction: ['building', 'construction', 'architect', 'engineer', 'contractor', 'worker', 'material', 'concrete', 'steel', 'wood', 'brick', 'stone', 'glass', 'roof', 'foundation', 'structure', 'design', 'plan', 'blueprint', 'project'],
    manufacturing: ['factory', 'industry', 'production', 'manufacturing', 'assembly', 'machine', 'equipment', 'tool', 'worker', 'operator', 'supervisor', 'manager', 'quality', 'control', 'inspection', 'testing', 'packaging', 'shipping', 'delivery', 'supply'],
    agriculture: ['farm', 'farmer', 'agriculture', 'crop', 'harvest', 'plant', 'seed', 'soil', 'fertilizer', 'irrigation', 'tractor', 'equipment', 'livestock', 'cattle', 'sheep', 'pig', 'chicken', 'dairy', 'milk', 'egg'],
    mining: ['mine', 'mining', 'miner', 'coal', 'oil', 'gas', 'gold', 'silver', 'copper', 'iron', 'diamond', 'extraction', 'drilling', 'excavation', 'tunnel', 'shaft', 'equipment', 'machinery', 'safety', 'environment'],
    energy: ['energy', 'power', 'electricity', 'generator', 'battery', 'solar', 'wind', 'nuclear', 'coal', 'oil', 'gas', 'renewable', 'sustainable', 'efficient', 'consumption', 'conservation', 'grid', 'transmission', 'distribution', 'supply'],
    environment: ['environment', 'nature', 'ecology', 'ecosystem', 'biodiversity', 'conservation', 'protection', 'pollution', 'contamination', 'waste', 'recycling', 'sustainability', 'climate', 'change', 'global', 'warming', 'carbon', 'emission', 'renewable', 'green']
  };

  const words = categoryWords[category] || [`${category}word`];
  return words[index % words.length] || `${category}${index}`;
};

const generatePopularWords = () => {
  const commonWords = [
    'the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they',
    'this', 'have', 'from', 'not', 'word', 'but', 'what', 'some', 'said', 'each',
    'which', 'their', 'time', 'will', 'about', 'there', 'many', 'then', 'them', 'these',
    'would', 'like', 'into', 'him', 'has', 'more', 'her', 'two', 'its', 'now',
    'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'
  ];

  const technologyWords = [
    'computer', 'internet', 'software', 'website', 'application', 'database', 'algorithm', 'programming',
    'javascript', 'python', 'artificial', 'intelligence', 'machine', 'learning', 'network', 'security',
    'encryption', 'blockchain', 'cryptocurrency', 'bitcoin', 'server', 'client', 'framework', 'library',
    'function', 'variable', 'array', 'object', 'string', 'number', 'boolean', 'null', 'undefined',
    'class', 'method', 'property', 'interface', 'component', 'module', 'package', 'import', 'export',
    'async', 'await', 'promise', 'callback', 'event', 'listener', 'handler', 'api', 'rest', 'json'
  ];

  const actionWords = [
    'run', 'walk', 'jump', 'sit', 'stand', 'eat', 'drink', 'sleep', 'work', 'play',
    'read', 'write', 'speak', 'listen', 'watch', 'look', 'see', 'hear', 'feel', 'think',
    'know', 'understand', 'learn', 'teach', 'help', 'give', 'take', 'make', 'create', 'build',
    'fix', 'repair', 'clean', 'wash', 'cook', 'drive', 'travel', 'visit', 'meet', 'talk',
    'call', 'send', 'receive', 'buy', 'sell', 'pay', 'save', 'spend', 'invest', 'earn'
  ];

  const businessWords = [
    'company', 'business', 'market', 'customer', 'client', 'service', 'product', 'sales', 'revenue', 'profit',
    'management', 'strategy', 'planning', 'project', 'team', 'employee', 'manager', 'director', 'executive', 'ceo',
    'finance', 'accounting', 'budget', 'investment', 'marketing', 'advertising', 'brand', 'promotion', 'campaign', 'target',
    'analysis', 'report', 'data', 'statistics', 'research', 'development', 'innovation', 'quality', 'standard', 'process',
    'procedure', 'policy', 'contract', 'agreement', 'negotiation', 'partnership', 'collaboration', 'competition', 'advantage', 'opportunity'
  ];

  const educationWords = [
    'school', 'student', 'teacher', 'education', 'learning', 'study', 'class', 'course', 'lesson', 'subject',
    'math', 'science', 'history', 'english', 'literature', 'art', 'music', 'sports', 'physics', 'chemistry',
    'biology', 'geography', 'psychology', 'philosophy', 'economics', 'politics', 'sociology', 'anthropology', 'linguistics', 'archaeology',
    'university', 'college', 'degree', 'diploma', 'certificate', 'graduation', 'exam', 'test', 'quiz', 'assignment',
    'homework', 'project', 'research', 'thesis', 'paper', 'essay', 'book', 'library', 'knowledge', 'skill'
  ];

  const healthWords = [
    'health', 'medical', 'doctor', 'hospital', 'patient', 'treatment', 'medicine', 'drug', 'therapy', 'surgery',
    'disease', 'illness', 'symptom', 'diagnosis', 'cure', 'healing', 'recovery', 'prevention', 'vaccine', 'immunity',
    'nutrition', 'diet', 'exercise', 'fitness', 'wellness', 'mental', 'physical', 'emotional', 'psychological', 'stress',
    'anxiety', 'depression', 'happiness', 'joy', 'peace', 'calm', 'relaxation', 'meditation', 'yoga', 'massage',
    'vitamin', 'mineral', 'protein', 'carbohydrate', 'fat', 'calorie', 'weight', 'height', 'age', 'gender'
  ];

  const natureWords = [
    'nature', 'environment', 'earth', 'planet', 'world', 'sky', 'sun', 'moon', 'star', 'cloud',
    'rain', 'snow', 'wind', 'storm', 'weather', 'climate', 'season', 'spring', 'summer', 'autumn',
    'winter', 'tree', 'forest', 'flower', 'plant', 'grass', 'leaf', 'branch', 'root', 'seed',
    'animal', 'bird', 'fish', 'insect', 'mammal', 'reptile', 'amphibian', 'species', 'habitat', 'ecosystem',
    'ocean', 'sea', 'lake', 'river', 'stream', 'mountain', 'hill', 'valley', 'desert', 'beach'
  ];

  const foodWords = [
    'food', 'eat', 'drink', 'meal', 'breakfast', 'lunch', 'dinner', 'snack', 'restaurant', 'kitchen',
    'cook', 'recipe', 'ingredient', 'flavor', 'taste', 'sweet', 'sour', 'bitter', 'salty', 'spicy',
    'fruit', 'vegetable', 'meat', 'fish', 'chicken', 'beef', 'pork', 'bread', 'rice', 'pasta',
    'pizza', 'burger', 'sandwich', 'salad', 'soup', 'cake', 'cookie', 'chocolate', 'ice', 'cream',
    'coffee', 'tea', 'water', 'juice', 'milk', 'wine', 'beer', 'alcohol', 'sugar', 'salt'
  ];

  const travelWords = [
    'travel', 'trip', 'journey', 'vacation', 'holiday', 'tourist', 'destination', 'hotel', 'flight', 'airport',
    'plane', 'train', 'bus', 'car', 'taxi', 'ship', 'boat', 'cruise', 'ticket', 'passport',
    'visa', 'luggage', 'suitcase', 'backpack', 'map', 'guide', 'tour', 'adventure', 'explore', 'discover',
    'country', 'city', 'town', 'village', 'street', 'road', 'highway', 'bridge', 'building', 'monument',
    'museum', 'gallery', 'theater', 'cinema', 'park', 'garden', 'zoo', 'aquarium', 'beach', 'mountain'
  ];

  const sportsWords = [
    'sport', 'game', 'play', 'player', 'team', 'coach', 'training', 'practice', 'competition', 'tournament',
    'championship', 'winner', 'loser', 'score', 'goal', 'point', 'match', 'season', 'league', 'club',
    'football', 'soccer', 'basketball', 'baseball', 'tennis', 'golf', 'swimming', 'running', 'cycling', 'boxing',
    'wrestling', 'martial', 'arts', 'yoga', 'fitness', 'gym', 'exercise', 'workout', 'strength', 'endurance',
    'speed', 'agility', 'flexibility', 'balance', 'coordination', 'skill', 'technique', 'strategy', 'tactics', 'rules'
  ];

  const wordsList = [];
  let currentFreq = 100;

  commonWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(50, currentFreq - index),
      category: 'common',
      synonyms: []
    });
  });
  currentFreq = 95;

  technologyWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(40, currentFreq - Math.floor(index / 2)),
      category: 'technology',
      synonyms: []
    });
  });
  currentFreq = 90;

  actionWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(35, currentFreq - Math.floor(index / 2)),
      category: 'action',
      synonyms: []
    });
  });
  currentFreq = 85;

  businessWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(30, currentFreq - Math.floor(index / 2)),
      category: 'business',
      synonyms: []
    });
  });
  currentFreq = 80;

  educationWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(25, currentFreq - Math.floor(index / 2)),
      category: 'education',
      synonyms: []
    });
  });
  currentFreq = 75;

  healthWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(20, currentFreq - Math.floor(index / 2)),
      category: 'health',
      synonyms: []
    });
  });
  currentFreq = 70;

  natureWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(15, currentFreq - Math.floor(index / 2)),
      category: 'nature',
      synonyms: []
    });
  });
  currentFreq = 65;

  foodWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(10, currentFreq - Math.floor(index / 2)),
      category: 'food',
      synonyms: []
    });
  });
  currentFreq = 60;

  travelWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(8, currentFreq - Math.floor(index / 2)),
      category: 'travel',
      synonyms: []
    });
  });
  currentFreq = 55;

  sportsWords.forEach((word, index) => {
    wordsList.push({
      word,
      freq: Math.max(5, currentFreq - Math.floor(index / 2)),
      category: 'sports',
      synonyms: []
    });
  });

  const additionalCategories = [
    'communication', 'media', 'entertainment', 'science', 'mathematics', 'geography',
    'history', 'literature', 'art', 'music', 'fashion', 'beauty', 'home', 'family',
    'relationship', 'emotion', 'personality', 'behavior', 'social', 'culture',
    'religion', 'philosophy', 'politics', 'law', 'military', 'transportation',
    'construction', 'manufacturing', 'agriculture', 'mining', 'energy', 'environment'
  ];

  const wordsPerCategory = Math.floor((5000 - wordsList.length) / additionalCategories.length);
  let baseFreq = 50;

  additionalCategories.forEach((category, categoryIndex) => {
    for (let i = 0; i < wordsPerCategory; i++) {
      const wordIndex = categoryIndex * wordsPerCategory + i;

      wordsList.push({
        word: generateMeaningfulWord(category, i),
        freq: Math.max(1, baseFreq - Math.floor(wordIndex / 10)),
        category,
        synonyms: []
      });
    }
  });

  while (wordsList.length < 5000) {
    const remaining: number = 5000 - wordsList.length;
    wordsList.push({
      word: `word${wordsList.length + 1}`,
      freq: Math.max(1, 10 - Math.floor(remaining / 100)),
      category: 'general',
      synonyms: []
    });
  }

  const uniqueWords = new Map();
  wordsList.forEach(item => {
    if (!uniqueWords.has(item.word)) {
      uniqueWords.set(item.word, item);
    }
  });

  return Array.from(uniqueWords.values());
};

const popularWords = generatePopularWords();

async function populateDatabase() {
  const client = await pool.connect();

  try {
    console.log('  Clearing existing data...');
    await client.query('DELETE FROM search_logs');
    await client.query('DELETE FROM words');

    console.log(' Inserting 5000 popular words...');

    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < popularWords.length; i += batchSize) {
      const batch = popularWords.slice(i, i + batchSize);

      const values = batch.map((_word, index) => {
        const paramIndex = index * 6;
        return `($${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`;
      }).join(', ');

      const params = batch.flatMap(word => [
        word.word,
        word.freq,
        word.category,
        word.synonyms, 
        JSON.stringify({ category: word.category, synonyms: word.synonyms }),
        new Date()
      ]);

      const query = `
        INSERT INTO words (word, freq, category, synonyms, metadata, created_at)
        VALUES ${values}
      `;

      await client.query(query, params);
      insertedCount += batch.length;

      console.log(` Inserted ${insertedCount}/${popularWords.length} words`);
    }

    console.log(' Successfully populated database with popular words!');

    const result = await client.query(`
      SELECT
        COUNT(*) as total_words,
        AVG(freq) as avg_frequency,
        COUNT(DISTINCT category) as categories
      FROM words
    `);

    console.log('📊 Database Statistics:');
    console.log(`   Total words: ${result.rows[0].total_words}`);
    console.log(`   Average frequency: ${Math.round(result.rows[0].avg_frequency)}`);
    console.log(`   Categories: ${result.rows[0].categories}`);

  } catch (error) {
    console.error(' Error populating database:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  populateDatabase()
    .then(() => {
      console.log(' Database population completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error(' Database population failed:', error);
      process.exit(1);
    });
}

export { populateDatabase };
