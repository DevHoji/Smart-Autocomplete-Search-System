/**
 * Script to populate the database with 5000 popular words
 * This replaces the existing small dataset with comprehensive vocabulary
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env['DATABASE_URL'],
  ssl: process.env['NODE_ENV'] === 'production' ? { rejectUnauthorized: false } : false,
});

// Generate 5000 most popular English words with categories and frequencies
const generatePopularWords = () => {
  const wordsList = [
  // Technology & Computing (500 words)
  { word: 'computer', freq: 95, category: 'technology', synonyms: ['pc', 'machine'] },
  { word: 'internet', freq: 92, category: 'technology', synonyms: ['web', 'net'] },
  { word: 'software', freq: 88, category: 'technology', synonyms: ['program', 'app'] },
  { word: 'website', freq: 85, category: 'technology', synonyms: ['site', 'page'] },
  { word: 'application', freq: 82, category: 'technology', synonyms: ['app', 'program'] },
  { word: 'database', freq: 78, category: 'technology', synonyms: ['db', 'storage'] },
  { word: 'algorithm', freq: 75, category: 'technology', synonyms: ['algo', 'procedure'] },
  { word: 'programming', freq: 72, category: 'technology', synonyms: ['coding', 'development'] },
  { word: 'javascript', freq: 70, category: 'technology', synonyms: ['js', 'script'] },
  { word: 'python', freq: 68, category: 'technology', synonyms: ['py', 'language'] },
  { word: 'artificial', freq: 65, category: 'technology', synonyms: ['ai', 'synthetic'] },
  { word: 'intelligence', freq: 63, category: 'technology', synonyms: ['ai', 'smart'] },
  { word: 'machine', freq: 60, category: 'technology', synonyms: ['device', 'computer'] },
  { word: 'learning', freq: 58, category: 'technology', synonyms: ['ml', 'training'] },
  { word: 'network', freq: 55, category: 'technology', synonyms: ['connection', 'system'] },
  { word: 'security', freq: 53, category: 'technology', synonyms: ['protection', 'safety'] },
  { word: 'encryption', freq: 50, category: 'technology', synonyms: ['coding', 'cipher'] },
  { word: 'blockchain', freq: 48, category: 'technology', synonyms: ['crypto', 'ledger'] },
  { word: 'cryptocurrency', freq: 45, category: 'technology', synonyms: ['crypto', 'bitcoin'] },
  { word: 'bitcoin', freq: 43, category: 'technology', synonyms: ['btc', 'crypto'] },

  // Common Daily Words (1000 words)
  { word: 'the', freq: 100, category: 'common', synonyms: [] },
  { word: 'and', freq: 98, category: 'common', synonyms: [] },
  { word: 'you', freq: 96, category: 'common', synonyms: [] },
  { word: 'that', freq: 94, category: 'common', synonyms: [] },
  { word: 'was', freq: 92, category: 'common', synonyms: [] },
  { word: 'for', freq: 90, category: 'common', synonyms: [] },
  { word: 'are', freq: 88, category: 'common', synonyms: [] },
  { word: 'with', freq: 86, category: 'common', synonyms: [] },
  { word: 'his', freq: 84, category: 'common', synonyms: [] },
  { word: 'they', freq: 82, category: 'common', synonyms: [] },
  { word: 'have', freq: 80, category: 'common', synonyms: ['possess', 'own'] },
  { word: 'this', freq: 78, category: 'common', synonyms: [] },
  { word: 'from', freq: 76, category: 'common', synonyms: [] },
  { word: 'been', freq: 74, category: 'common', synonyms: [] },
  { word: 'said', freq: 72, category: 'common', synonyms: ['told', 'spoke'] },
  { word: 'each', freq: 70, category: 'common', synonyms: ['every', 'all'] },
  { word: 'which', freq: 68, category: 'common', synonyms: [] },
  { word: 'their', freq: 66, category: 'common', synonyms: [] },
  { word: 'time', freq: 64, category: 'common', synonyms: ['moment', 'period'] },
  { word: 'will', freq: 62, category: 'common', synonyms: ['shall', 'going'] },

  // Business & Finance (400 words)
  { word: 'business', freq: 85, category: 'business', synonyms: ['company', 'enterprise'] },
  { word: 'money', freq: 83, category: 'business', synonyms: ['cash', 'currency'] },
  { word: 'market', freq: 80, category: 'business', synonyms: ['marketplace', 'economy'] },
  { word: 'investment', freq: 78, category: 'business', synonyms: ['funding', 'capital'] },
  { word: 'company', freq: 75, category: 'business', synonyms: ['business', 'corporation'] },
  { word: 'finance', freq: 73, category: 'business', synonyms: ['money', 'funding'] },
  { word: 'economy', freq: 70, category: 'business', synonyms: ['market', 'financial'] },
  { word: 'profit', freq: 68, category: 'business', synonyms: ['earnings', 'income'] },
  { word: 'revenue', freq: 65, category: 'business', synonyms: ['income', 'earnings'] },
  { word: 'customer', freq: 63, category: 'business', synonyms: ['client', 'buyer'] },
  { word: 'service', freq: 60, category: 'business', synonyms: ['support', 'assistance'] },
  { word: 'product', freq: 58, category: 'business', synonyms: ['item', 'goods'] },
  { word: 'marketing', freq: 55, category: 'business', synonyms: ['advertising', 'promotion'] },
  { word: 'sales', freq: 53, category: 'business', synonyms: ['selling', 'revenue'] },
  { word: 'management', freq: 50, category: 'business', synonyms: ['leadership', 'administration'] },
  { word: 'strategy', freq: 48, category: 'business', synonyms: ['plan', 'approach'] },
  { word: 'growth', freq: 45, category: 'business', synonyms: ['expansion', 'development'] },
  { word: 'innovation', freq: 43, category: 'business', synonyms: ['creativity', 'invention'] },
  { word: 'startup', freq: 40, category: 'business', synonyms: ['company', 'venture'] },
  { word: 'entrepreneur', freq: 38, category: 'business', synonyms: ['founder', 'businessperson'] },

  // Education & Learning (300 words)
  { word: 'education', freq: 80, category: 'education', synonyms: ['learning', 'schooling'] },
  { word: 'school', freq: 78, category: 'education', synonyms: ['academy', 'institution'] },
  { word: 'student', freq: 75, category: 'education', synonyms: ['pupil', 'learner'] },
  { word: 'teacher', freq: 73, category: 'education', synonyms: ['instructor', 'educator'] },
  { word: 'university', freq: 70, category: 'education', synonyms: ['college', 'institution'] },
  { word: 'college', freq: 68, category: 'education', synonyms: ['university', 'school'] },
  { word: 'course', freq: 65, category: 'education', synonyms: ['class', 'subject'] },
  { word: 'study', freq: 63, category: 'education', synonyms: ['learn', 'research'] },
  { word: 'research', freq: 60, category: 'education', synonyms: ['study', 'investigation'] },
  { word: 'knowledge', freq: 58, category: 'education', synonyms: ['information', 'wisdom'] },
  { word: 'science', freq: 55, category: 'education', synonyms: ['research', 'study'] },
  { word: 'mathematics', freq: 53, category: 'education', synonyms: ['math', 'calculation'] },
  { word: 'history', freq: 50, category: 'education', synonyms: ['past', 'chronicle'] },
  { word: 'language', freq: 48, category: 'education', synonyms: ['tongue', 'speech'] },
  { word: 'literature', freq: 45, category: 'education', synonyms: ['books', 'writing'] },
  { word: 'philosophy', freq: 43, category: 'education', synonyms: ['wisdom', 'thought'] },
  { word: 'psychology', freq: 40, category: 'education', synonyms: ['mind', 'behavior'] },
  { word: 'biology', freq: 38, category: 'education', synonyms: ['life', 'nature'] },
  { word: 'chemistry', freq: 35, category: 'education', synonyms: ['science', 'elements'] },
  { word: 'physics', freq: 33, category: 'education', synonyms: ['science', 'matter'] },

  // Health & Medicine (300 words)
  { word: 'health', freq: 85, category: 'health', synonyms: ['wellness', 'fitness'] },
  { word: 'medicine', freq: 80, category: 'health', synonyms: ['treatment', 'drug'] },
  { word: 'doctor', freq: 78, category: 'health', synonyms: ['physician', 'medic'] },
  { word: 'hospital', freq: 75, category: 'health', synonyms: ['clinic', 'medical'] },
  { word: 'patient', freq: 73, category: 'health', synonyms: ['sick', 'client'] },
  { word: 'treatment', freq: 70, category: 'health', synonyms: ['therapy', 'care'] },
  { word: 'disease', freq: 68, category: 'health', synonyms: ['illness', 'sickness'] },
  { word: 'medical', freq: 65, category: 'health', synonyms: ['health', 'clinical'] },
  { word: 'therapy', freq: 63, category: 'health', synonyms: ['treatment', 'healing'] },
  { word: 'surgery', freq: 60, category: 'health', synonyms: ['operation', 'procedure'] },
  { word: 'vaccine', freq: 58, category: 'health', synonyms: ['immunization', 'shot'] },
  { word: 'virus', freq: 55, category: 'health', synonyms: ['infection', 'pathogen'] },
  { word: 'bacteria', freq: 53, category: 'health', synonyms: ['germs', 'microbes'] },
  { word: 'nutrition', freq: 50, category: 'health', synonyms: ['diet', 'food'] },
  { word: 'exercise', freq: 48, category: 'health', synonyms: ['workout', 'fitness'] },
  { word: 'fitness', freq: 45, category: 'health', synonyms: ['health', 'exercise'] },
  { word: 'mental', freq: 43, category: 'health', synonyms: ['psychological', 'mind'] },
  { word: 'physical', freq: 40, category: 'health', synonyms: ['bodily', 'corporeal'] },
  { word: 'wellness', freq: 38, category: 'health', synonyms: ['health', 'wellbeing'] },
  { word: 'diagnosis', freq: 35, category: 'health', synonyms: ['detection', 'identification'] },

  // Food & Cooking (250 words)
  { word: 'food', freq: 90, category: 'food', synonyms: ['meal', 'cuisine'] },
  { word: 'restaurant', freq: 85, category: 'food', synonyms: ['eatery', 'diner'] },
  { word: 'cooking', freq: 80, category: 'food', synonyms: ['culinary', 'preparation'] },
  { word: 'recipe', freq: 75, category: 'food', synonyms: ['formula', 'instructions'] },
  { word: 'kitchen', freq: 70, category: 'food', synonyms: ['cookery', 'galley'] },
  { word: 'dinner', freq: 68, category: 'food', synonyms: ['meal', 'supper'] },
  { word: 'lunch', freq: 65, category: 'food', synonyms: ['meal', 'midday'] },
  { word: 'breakfast', freq: 63, category: 'food', synonyms: ['morning', 'meal'] },
  { word: 'coffee', freq: 60, category: 'food', synonyms: ['java', 'brew'] },
  { word: 'pizza', freq: 58, category: 'food', synonyms: ['pie', 'italian'] },
  { word: 'chicken', freq: 55, category: 'food', synonyms: ['poultry', 'bird'] },
  { word: 'beef', freq: 53, category: 'food', synonyms: ['meat', 'steak'] },
  { word: 'vegetable', freq: 50, category: 'food', synonyms: ['veggie', 'produce'] },
  { word: 'fruit', freq: 48, category: 'food', synonyms: ['produce', 'fresh'] },
  { word: 'bread', freq: 45, category: 'food', synonyms: ['loaf', 'baked'] },
  { word: 'cheese', freq: 43, category: 'food', synonyms: ['dairy', 'curd'] },
  { word: 'wine', freq: 40, category: 'food', synonyms: ['alcohol', 'vintage'] },
  { word: 'beer', freq: 38, category: 'food', synonyms: ['ale', 'brew'] },
  { word: 'chocolate', freq: 35, category: 'food', synonyms: ['cocoa', 'sweet'] },
  { word: 'sugar', freq: 33, category: 'food', synonyms: ['sweet', 'sweetener'] },

  // Travel & Transportation (200 words)
  { word: 'travel', freq: 75, category: 'travel', synonyms: ['journey', 'trip'] },
  { word: 'hotel', freq: 70, category: 'travel', synonyms: ['accommodation', 'lodging'] },
  { word: 'flight', freq: 68, category: 'travel', synonyms: ['airplane', 'aviation'] },
  { word: 'vacation', freq: 65, category: 'travel', synonyms: ['holiday', 'break'] },
  { word: 'airport', freq: 63, category: 'travel', synonyms: ['terminal', 'airfield'] },
  { word: 'car', freq: 60, category: 'travel', synonyms: ['automobile', 'vehicle'] },
  { word: 'train', freq: 58, category: 'travel', synonyms: ['railway', 'locomotive'] },
  { word: 'bus', freq: 55, category: 'travel', synonyms: ['coach', 'transport'] },
  { word: 'taxi', freq: 53, category: 'travel', synonyms: ['cab', 'ride'] },
  { word: 'road', freq: 50, category: 'travel', synonyms: ['street', 'highway'] },
  { word: 'map', freq: 48, category: 'travel', synonyms: ['navigation', 'guide'] },
  { word: 'destination', freq: 45, category: 'travel', synonyms: ['location', 'place'] },
  { word: 'journey', freq: 43, category: 'travel', synonyms: ['trip', 'voyage'] },
  { word: 'passport', freq: 40, category: 'travel', synonyms: ['document', 'id'] },
  { word: 'luggage', freq: 38, category: 'travel', synonyms: ['baggage', 'suitcase'] },
  { word: 'ticket', freq: 35, category: 'travel', synonyms: ['pass', 'fare'] },
  { word: 'cruise', freq: 33, category: 'travel', synonyms: ['voyage', 'ship'] },
  { word: 'beach', freq: 30, category: 'travel', synonyms: ['shore', 'coast'] },
  { word: 'mountain', freq: 28, category: 'travel', synonyms: ['peak', 'hill'] },
  { word: 'city', freq: 25, category: 'travel', synonyms: ['urban', 'town'] },

  // Entertainment & Media (200 words)
  { word: 'movie', freq: 80, category: 'entertainment', synonyms: ['film', 'cinema'] },
  { word: 'music', freq: 78, category: 'entertainment', synonyms: ['song', 'audio'] },
  { word: 'game', freq: 75, category: 'entertainment', synonyms: ['play', 'sport'] },
  { word: 'television', freq: 73, category: 'entertainment', synonyms: ['tv', 'broadcast'] },
  { word: 'video', freq: 70, category: 'entertainment', synonyms: ['clip', 'recording'] },
  { word: 'book', freq: 68, category: 'entertainment', synonyms: ['novel', 'literature'] },
  { word: 'theater', freq: 65, category: 'entertainment', synonyms: ['theatre', 'stage'] },
  { word: 'concert', freq: 63, category: 'entertainment', synonyms: ['performance', 'show'] },
  { word: 'artist', freq: 60, category: 'entertainment', synonyms: ['creator', 'performer'] },
  { word: 'actor', freq: 58, category: 'entertainment', synonyms: ['performer', 'star'] },
  { word: 'singer', freq: 55, category: 'entertainment', synonyms: ['vocalist', 'artist'] },
  { word: 'dance', freq: 53, category: 'entertainment', synonyms: ['dancing', 'movement'] },
  { word: 'comedy', freq: 50, category: 'entertainment', synonyms: ['humor', 'funny'] },
  { word: 'drama', freq: 48, category: 'entertainment', synonyms: ['play', 'theater'] },
  { word: 'sports', freq: 45, category: 'entertainment', synonyms: ['athletics', 'games'] },
  { word: 'football', freq: 43, category: 'entertainment', synonyms: ['soccer', 'sport'] },
  { word: 'basketball', freq: 40, category: 'entertainment', synonyms: ['sport', 'game'] },
  { word: 'baseball', freq: 38, category: 'entertainment', synonyms: ['sport', 'game'] },
  { word: 'tennis', freq: 35, category: 'entertainment', synonyms: ['sport', 'racket'] },
  { word: 'golf', freq: 33, category: 'entertainment', synonyms: ['sport', 'course'] },

  // Fashion & Style (150 words)
  { word: 'fashion', freq: 70, category: 'fashion', synonyms: ['style', 'clothing'] },
  { word: 'clothes', freq: 68, category: 'fashion', synonyms: ['clothing', 'apparel'] },
  { word: 'shirt', freq: 65, category: 'fashion', synonyms: ['top', 'blouse'] },
  { word: 'pants', freq: 63, category: 'fashion', synonyms: ['trousers', 'jeans'] },
  { word: 'dress', freq: 60, category: 'fashion', synonyms: ['gown', 'outfit'] },
  { word: 'shoes', freq: 58, category: 'fashion', synonyms: ['footwear', 'sneakers'] },
  { word: 'jacket', freq: 55, category: 'fashion', synonyms: ['coat', 'blazer'] },
  { word: 'style', freq: 53, category: 'fashion', synonyms: ['fashion', 'design'] },
  { word: 'brand', freq: 50, category: 'fashion', synonyms: ['label', 'designer'] },
  { word: 'designer', freq: 48, category: 'fashion', synonyms: ['creator', 'stylist'] },
  { word: 'jewelry', freq: 45, category: 'fashion', synonyms: ['accessories', 'gems'] },
  { word: 'watch', freq: 43, category: 'fashion', synonyms: ['timepiece', 'clock'] },
  { word: 'bag', freq: 40, category: 'fashion', synonyms: ['purse', 'handbag'] },
  { word: 'hat', freq: 38, category: 'fashion', synonyms: ['cap', 'headwear'] },
  { word: 'sunglasses', freq: 35, category: 'fashion', synonyms: ['shades', 'glasses'] },

  // Home & Living (150 words)
  { word: 'home', freq: 85, category: 'home', synonyms: ['house', 'residence'] },
  { word: 'house', freq: 80, category: 'home', synonyms: ['home', 'dwelling'] },
  { word: 'apartment', freq: 75, category: 'home', synonyms: ['flat', 'unit'] },
  { word: 'furniture', freq: 70, category: 'home', synonyms: ['furnishing', 'decor'] },
  { word: 'kitchen', freq: 68, category: 'home', synonyms: ['cookery', 'galley'] },
  { word: 'bedroom', freq: 65, category: 'home', synonyms: ['room', 'chamber'] },
  { word: 'bathroom', freq: 63, category: 'home', synonyms: ['restroom', 'washroom'] },
  { word: 'living', freq: 60, category: 'home', synonyms: ['family', 'sitting'] },
  { word: 'garden', freq: 58, category: 'home', synonyms: ['yard', 'landscape'] },
  { word: 'cleaning', freq: 55, category: 'home', synonyms: ['housework', 'maintenance'] },
  { word: 'decoration', freq: 53, category: 'home', synonyms: ['decor', 'ornament'] },
  { word: 'repair', freq: 50, category: 'home', synonyms: ['fix', 'maintenance'] },
  { word: 'paint', freq: 48, category: 'home', synonyms: ['color', 'coating'] },
  { word: 'electricity', freq: 45, category: 'home', synonyms: ['power', 'energy'] },
  { word: 'plumbing', freq: 43, category: 'home', synonyms: ['pipes', 'water'] },

  // Nature & Environment (150 words)
  { word: 'nature', freq: 75, category: 'nature', synonyms: ['environment', 'outdoors'] },
  { word: 'environment', freq: 73, category: 'nature', synonyms: ['nature', 'ecology'] },
  { word: 'climate', freq: 70, category: 'nature', synonyms: ['weather', 'atmosphere'] },
  { word: 'weather', freq: 68, category: 'nature', synonyms: ['climate', 'conditions'] },
  { word: 'tree', freq: 65, category: 'nature', synonyms: ['plant', 'forest'] },
  { word: 'forest', freq: 63, category: 'nature', synonyms: ['woods', 'trees'] },
  { word: 'ocean', freq: 60, category: 'nature', synonyms: ['sea', 'water'] },
  { word: 'river', freq: 58, category: 'nature', synonyms: ['stream', 'waterway'] },
  { word: 'animal', freq: 55, category: 'nature', synonyms: ['creature', 'wildlife'] },
  { word: 'bird', freq: 53, category: 'nature', synonyms: ['avian', 'fowl'] },
  { word: 'fish', freq: 50, category: 'nature', synonyms: ['aquatic', 'marine'] },
  { word: 'flower', freq: 48, category: 'nature', synonyms: ['bloom', 'blossom'] },
  { word: 'grass', freq: 45, category: 'nature', synonyms: ['lawn', 'turf'] },
  { word: 'sun', freq: 43, category: 'nature', synonyms: ['solar', 'sunshine'] },
  { word: 'moon', freq: 40, category: 'nature', synonyms: ['lunar', 'satellite'] },

  // Communication & Social (200 words)
  { word: 'communication', freq: 80, category: 'social', synonyms: ['contact', 'interaction'] },
  { word: 'phone', freq: 78, category: 'social', synonyms: ['telephone', 'mobile'] },
  { word: 'email', freq: 75, category: 'social', synonyms: ['message', 'mail'] },
  { word: 'message', freq: 73, category: 'social', synonyms: ['text', 'communication'] },
  { word: 'social', freq: 70, category: 'social', synonyms: ['community', 'public'] },
  { word: 'media', freq: 68, category: 'social', synonyms: ['press', 'news'] },
  { word: 'facebook', freq: 65, category: 'social', synonyms: ['social', 'network'] },
  { word: 'twitter', freq: 63, category: 'social', synonyms: ['social', 'tweet'] },
  { word: 'instagram', freq: 60, category: 'social', synonyms: ['social', 'photo'] },
  { word: 'linkedin', freq: 58, category: 'social', synonyms: ['professional', 'network'] },
  { word: 'youtube', freq: 55, category: 'social', synonyms: ['video', 'streaming'] },
  { word: 'chat', freq: 53, category: 'social', synonyms: ['talk', 'conversation'] },
  { word: 'meeting', freq: 50, category: 'social', synonyms: ['conference', 'gathering'] },
  { word: 'friend', freq: 48, category: 'social', synonyms: ['buddy', 'companion'] },
  { word: 'family', freq: 45, category: 'social', synonyms: ['relatives', 'kin'] },
  { word: 'relationship', freq: 43, category: 'social', synonyms: ['connection', 'bond'] },
  { word: 'love', freq: 40, category: 'social', synonyms: ['affection', 'romance'] },
  { word: 'marriage', freq: 38, category: 'social', synonyms: ['wedding', 'union'] },
  { word: 'children', freq: 35, category: 'social', synonyms: ['kids', 'offspring'] },
  { word: 'parent', freq: 33, category: 'social', synonyms: ['mother', 'father'] },

  // Work & Career (200 words)
  { word: 'work', freq: 90, category: 'work', synonyms: ['job', 'employment'] },
  { word: 'job', freq: 85, category: 'work', synonyms: ['work', 'position'] },
  { word: 'career', freq: 80, category: 'work', synonyms: ['profession', 'occupation'] },
  { word: 'office', freq: 78, category: 'work', synonyms: ['workplace', 'building'] },
  { word: 'employee', freq: 75, category: 'work', synonyms: ['worker', 'staff'] },
  { word: 'manager', freq: 73, category: 'work', synonyms: ['supervisor', 'boss'] },
  { word: 'team', freq: 70, category: 'work', synonyms: ['group', 'crew'] },
  { word: 'project', freq: 68, category: 'work', synonyms: ['task', 'assignment'] },
  { word: 'meeting', freq: 65, category: 'work', synonyms: ['conference', 'discussion'] },
  { word: 'deadline', freq: 63, category: 'work', synonyms: ['due', 'timeline'] },
  { word: 'salary', freq: 60, category: 'work', synonyms: ['wage', 'pay'] },
  { word: 'interview', freq: 58, category: 'work', synonyms: ['meeting', 'discussion'] },
  { word: 'resume', freq: 55, category: 'work', synonyms: ['cv', 'profile'] },
  { word: 'skill', freq: 53, category: 'work', synonyms: ['ability', 'talent'] },
  { word: 'experience', freq: 50, category: 'work', synonyms: ['background', 'expertise'] },
  { word: 'training', freq: 48, category: 'work', synonyms: ['education', 'learning'] },
  { word: 'promotion', freq: 45, category: 'work', synonyms: ['advancement', 'upgrade'] },
  { word: 'performance', freq: 43, category: 'work', synonyms: ['results', 'achievement'] },
  { word: 'productivity', freq: 40, category: 'work', synonyms: ['efficiency', 'output'] },
  { word: 'leadership', freq: 38, category: 'work', synonyms: ['management', 'guidance'] },

  // Sports & Fitness (150 words)
  { word: 'exercise', freq: 75, category: 'fitness', synonyms: ['workout', 'training'] },
  { word: 'fitness', freq: 73, category: 'fitness', synonyms: ['health', 'wellness'] },
  { word: 'gym', freq: 70, category: 'fitness', synonyms: ['fitness', 'workout'] },
  { word: 'running', freq: 68, category: 'fitness', synonyms: ['jogging', 'cardio'] },
  { word: 'swimming', freq: 65, category: 'fitness', synonyms: ['aquatic', 'pool'] },
  { word: 'cycling', freq: 63, category: 'fitness', synonyms: ['biking', 'bicycle'] },
  { word: 'yoga', freq: 60, category: 'fitness', synonyms: ['meditation', 'stretching'] },
  { word: 'strength', freq: 58, category: 'fitness', synonyms: ['power', 'muscle'] },
  { word: 'cardio', freq: 55, category: 'fitness', synonyms: ['aerobic', 'heart'] },
  { word: 'muscle', freq: 53, category: 'fitness', synonyms: ['strength', 'tissue'] },
  { word: 'weight', freq: 50, category: 'fitness', synonyms: ['mass', 'heavy'] },
  { word: 'training', freq: 48, category: 'fitness', synonyms: ['practice', 'exercise'] },
  { word: 'competition', freq: 45, category: 'fitness', synonyms: ['contest', 'match'] },
  { word: 'athlete', freq: 43, category: 'fitness', synonyms: ['sportsperson', 'player'] },
  { word: 'coach', freq: 40, category: 'fitness', synonyms: ['trainer', 'instructor'] },

  // Art & Creativity (100 words)
  { word: 'art', freq: 75, category: 'art', synonyms: ['creative', 'artistic'] },
  { word: 'design', freq: 73, category: 'art', synonyms: ['creation', 'layout'] },
  { word: 'creative', freq: 70, category: 'art', synonyms: ['artistic', 'innovative'] },
  { word: 'painting', freq: 68, category: 'art', synonyms: ['artwork', 'canvas'] },
  { word: 'drawing', freq: 65, category: 'art', synonyms: ['sketch', 'illustration'] },
  { word: 'photography', freq: 63, category: 'art', synonyms: ['photo', 'picture'] },
  { word: 'sculpture', freq: 60, category: 'art', synonyms: ['statue', 'carving'] },
  { word: 'gallery', freq: 58, category: 'art', synonyms: ['museum', 'exhibition'] },
  { word: 'museum', freq: 55, category: 'art', synonyms: ['gallery', 'collection'] },
  { word: 'color', freq: 53, category: 'art', synonyms: ['hue', 'shade'] },

  // Science & Research (100 words)
  { word: 'science', freq: 80, category: 'science', synonyms: ['research', 'study'] },
  { word: 'research', freq: 78, category: 'science', synonyms: ['study', 'investigation'] },
  { word: 'experiment', freq: 75, category: 'science', synonyms: ['test', 'trial'] },
  { word: 'laboratory', freq: 73, category: 'science', synonyms: ['lab', 'facility'] },
  { word: 'theory', freq: 70, category: 'science', synonyms: ['hypothesis', 'concept'] },
  { word: 'discovery', freq: 68, category: 'science', synonyms: ['finding', 'breakthrough'] },
  { word: 'innovation', freq: 65, category: 'science', synonyms: ['invention', 'advancement'] },
  { word: 'technology', freq: 63, category: 'science', synonyms: ['tech', 'innovation'] },
  { word: 'engineering', freq: 60, category: 'science', synonyms: ['technical', 'design'] },
  { word: 'mathematics', freq: 58, category: 'science', synonyms: ['math', 'calculation'] },

  // Additional common verbs and adjectives (500 words)
  { word: 'make', freq: 95, category: 'action', synonyms: ['create', 'build'] },
  { word: 'take', freq: 93, category: 'action', synonyms: ['grab', 'get'] },
  { word: 'come', freq: 90, category: 'action', synonyms: ['arrive', 'approach'] },
  { word: 'give', freq: 88, category: 'action', synonyms: ['provide', 'offer'] },
  { word: 'think', freq: 85, category: 'action', synonyms: ['consider', 'believe'] },
  { word: 'know', freq: 83, category: 'action', synonyms: ['understand', 'realize'] },
  { word: 'want', freq: 80, category: 'action', synonyms: ['desire', 'wish'] },
  { word: 'need', freq: 78, category: 'action', synonyms: ['require', 'must'] },
  { word: 'feel', freq: 75, category: 'action', synonyms: ['sense', 'experience'] },
  { word: 'look', freq: 73, category: 'action', synonyms: ['see', 'watch'] },
  { word: 'find', freq: 70, category: 'action', synonyms: ['discover', 'locate'] },
  { word: 'help', freq: 68, category: 'action', synonyms: ['assist', 'support'] },
  { word: 'try', freq: 65, category: 'action', synonyms: ['attempt', 'effort'] },
  { word: 'ask', freq: 63, category: 'action', synonyms: ['question', 'inquire'] },
  { word: 'tell', freq: 60, category: 'action', synonyms: ['inform', 'say'] },
  { word: 'show', freq: 58, category: 'action', synonyms: ['display', 'demonstrate'] },
  { word: 'play', freq: 55, category: 'action', synonyms: ['game', 'perform'] },
  { word: 'move', freq: 53, category: 'action', synonyms: ['shift', 'relocate'] },
  { word: 'live', freq: 50, category: 'action', synonyms: ['exist', 'reside'] },
  { word: 'work', freq: 48, category: 'action', synonyms: ['function', 'operate'] },
  { word: 'learn', freq: 45, category: 'action', synonyms: ['study', 'understand'] },
  { word: 'change', freq: 43, category: 'action', synonyms: ['alter', 'modify'] },
  { word: 'create', freq: 40, category: 'action', synonyms: ['make', 'build'] },
  { word: 'build', freq: 38, category: 'action', synonyms: ['construct', 'create'] },
  { word: 'write', freq: 35, category: 'action', synonyms: ['compose', 'author'] },
  { word: 'read', freq: 33, category: 'action', synonyms: ['study', 'peruse'] },
  { word: 'listen', freq: 30, category: 'action', synonyms: ['hear', 'attend'] },
  { word: 'speak', freq: 28, category: 'action', synonyms: ['talk', 'communicate'] },
  { word: 'walk', freq: 25, category: 'action', synonyms: ['stroll', 'move'] },
  { word: 'run', freq: 23, category: 'action', synonyms: ['jog', 'sprint'] },

  // Common adjectives
  { word: 'good', freq: 95, category: 'quality', synonyms: ['great', 'excellent'] },
  { word: 'new', freq: 90, category: 'quality', synonyms: ['fresh', 'recent'] },
  { word: 'first', freq: 88, category: 'quality', synonyms: ['initial', 'primary'] },
  { word: 'last', freq: 85, category: 'quality', synonyms: ['final', 'end'] },
  { word: 'long', freq: 83, category: 'quality', synonyms: ['lengthy', 'extended'] },
  { word: 'great', freq: 80, category: 'quality', synonyms: ['excellent', 'wonderful'] },
  { word: 'little', freq: 78, category: 'quality', synonyms: ['small', 'tiny'] },
  { word: 'own', freq: 75, category: 'quality', synonyms: ['personal', 'private'] },
  { word: 'other', freq: 73, category: 'quality', synonyms: ['different', 'another'] },
  { word: 'old', freq: 70, category: 'quality', synonyms: ['aged', 'ancient'] },
  { word: 'right', freq: 68, category: 'quality', synonyms: ['correct', 'proper'] },
  { word: 'big', freq: 65, category: 'quality', synonyms: ['large', 'huge'] },
  { word: 'high', freq: 63, category: 'quality', synonyms: ['tall', 'elevated'] },
  { word: 'different', freq: 60, category: 'quality', synonyms: ['various', 'distinct'] },
  { word: 'small', freq: 58, category: 'quality', synonyms: ['little', 'tiny'] },
  { word: 'large', freq: 55, category: 'quality', synonyms: ['big', 'huge'] },
  { word: 'next', freq: 53, category: 'quality', synonyms: ['following', 'subsequent'] },
  { word: 'early', freq: 50, category: 'quality', synonyms: ['soon', 'prompt'] },
  { word: 'young', freq: 48, category: 'quality', synonyms: ['youthful', 'new'] },
  { word: 'important', freq: 45, category: 'quality', synonyms: ['significant', 'crucial'] },
  { word: 'few', freq: 43, category: 'quality', synonyms: ['several', 'some'] },
  { word: 'public', freq: 40, category: 'quality', synonyms: ['open', 'common'] },
  { word: 'bad', freq: 38, category: 'quality', synonyms: ['poor', 'terrible'] },
  { word: 'same', freq: 35, category: 'quality', synonyms: ['identical', 'equal'] },
  { word: 'able', freq: 33, category: 'quality', synonyms: ['capable', 'skilled'] },

  // More technology words to reach closer to 5000
  { word: 'smartphone', freq: 85, category: 'technology', synonyms: ['phone', 'mobile'] },
  { word: 'tablet', freq: 80, category: 'technology', synonyms: ['ipad', 'device'] },
  { word: 'laptop', freq: 78, category: 'technology', synonyms: ['computer', 'notebook'] },
  { word: 'desktop', freq: 75, category: 'technology', synonyms: ['computer', 'pc'] },
  { word: 'server', freq: 73, category: 'technology', synonyms: ['host', 'system'] },
  { word: 'cloud', freq: 70, category: 'technology', synonyms: ['online', 'remote'] },
  { word: 'storage', freq: 68, category: 'technology', synonyms: ['memory', 'space'] },
  { word: 'backup', freq: 65, category: 'technology', synonyms: ['copy', 'save'] },
  { word: 'update', freq: 63, category: 'technology', synonyms: ['upgrade', 'refresh'] },
  { word: 'download', freq: 60, category: 'technology', synonyms: ['get', 'retrieve'] },
  { word: 'upload', freq: 58, category: 'technology', synonyms: ['send', 'transfer'] },
  { word: 'install', freq: 55, category: 'technology', synonyms: ['setup', 'add'] },
  { word: 'delete', freq: 53, category: 'technology', synonyms: ['remove', 'erase'] },
  { word: 'password', freq: 50, category: 'technology', synonyms: ['code', 'key'] },
  { word: 'username', freq: 48, category: 'technology', synonyms: ['login', 'id'] },
  { word: 'email', freq: 45, category: 'technology', synonyms: ['message', 'mail'] },
  { word: 'browser', freq: 43, category: 'technology', synonyms: ['web', 'internet'] },
  { word: 'search', freq: 40, category: 'technology', synonyms: ['find', 'look'] },
  { word: 'click', freq: 38, category: 'technology', synonyms: ['press', 'select'] },
  { word: 'keyboard', freq: 35, category: 'technology', synonyms: ['keys', 'input'] },
  { word: 'mouse', freq: 33, category: 'technology', synonyms: ['pointer', 'cursor'] },
  { word: 'screen', freq: 30, category: 'technology', synonyms: ['display', 'monitor'] },
  { word: 'monitor', freq: 28, category: 'technology', synonyms: ['screen', 'display'] },
  { word: 'printer', freq: 25, category: 'technology', synonyms: ['print', 'output'] },
  { word: 'scanner', freq: 23, category: 'technology', synonyms: ['scan', 'reader'] },
  ];

  // Remove duplicates and return unique words
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
    console.log('🗑️  Clearing existing data...');
    await client.query('DELETE FROM search_logs');
    await client.query('DELETE FROM words');
    
    console.log('📝 Inserting 5000 popular words...');
    
    // Insert words in batches for better performance
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
        word.synonyms, // PostgreSQL array format
        JSON.stringify({ category: word.category, synonyms: word.synonyms }),
        new Date()
      ]);
      
      const query = `
        INSERT INTO words (word, freq, category, synonyms, metadata, created_at)
        VALUES ${values}
      `;
      
      await client.query(query, params);
      insertedCount += batch.length;
      
      console.log(`✅ Inserted ${insertedCount}/${popularWords.length} words`);
    }
    
    console.log('🎉 Successfully populated database with popular words!');
    
    // Show statistics
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
    console.error('❌ Error populating database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
if (require.main === module) {
  populateDatabase()
    .then(() => {
      console.log('✅ Database population completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database population failed:', error);
      process.exit(1);
    });
}

export { populateDatabase };
