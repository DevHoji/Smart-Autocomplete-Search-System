

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getDatabase } from '../src/utils/database';
import { createTables } from './migrate';

dotenv.config();

interface SeedWord {
  word: string;
  freq: number;
  category?: string;
  synonyms?: string[];
  metadata?: Record<string, any>;
}

async function seedDatabase() {
  const db = getDatabase({
    connectionString: process.env['DATABASE_URL']!,
    ssl: true, 
  });

  console.log(' Starting database seeding...');

  try {
    await createTables();

    const dataPath = join(__dirname, '../../data/sample-words.json');
    console.log(` Loading sample data from: ${dataPath}`);
    
    const rawData = readFileSync(dataPath, 'utf-8');
    const sampleWords: SeedWord[] = JSON.parse(rawData);
    
    console.log(` Found ${sampleWords.length} words to seed`);

    console.log(' Clearing existing data...');
    await db.query('DELETE FROM search_logs');
    await db.query('DELETE FROM words');
    await db.query('ALTER SEQUENCE words_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE search_logs_id_seq RESTART WITH 1');

    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < sampleWords.length; i += batchSize) {
      const batch = sampleWords.slice(i, i + batchSize);
      
      console.log(` Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sampleWords.length / batchSize)}...`);
      
      const values: any[] = [];
      const placeholders: string[] = [];
      
      batch.forEach((wordData, index) => {
        const baseIndex = index * 6;
        placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6})`);
        
        values.push(
          wordData.word,
          wordData.freq,
          wordData.category || null,
          wordData.synonyms || null,
          wordData.metadata || null,
          new Date()
        );
      });

      const query = `
        INSERT INTO words (word, freq, category, synonyms, metadata, created_at)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (word) DO UPDATE SET
          freq = EXCLUDED.freq,
          category = EXCLUDED.category,
          synonyms = EXCLUDED.synonyms,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
      `;

      await db.query(query, values);
      insertedCount += batch.length;
    }

    console.log(` Successfully seeded ${insertedCount} words`);

    console.log(' Adding sample search logs for analytics...');
    
    const sampleSearches = [
      { query: 'hello', selected_word: 'hello' },
      { query: 'hel', selected_word: 'help' },
      { query: 'prog', selected_word: 'programming' },
      { query: 'java', selected_word: 'javascript' },
      { query: 'react', selected_word: 'react' },
      { query: 'data', selected_word: 'database' },
      { query: 'user', selected_word: 'user' },
      { query: 'test', selected_word: 'test' },
      { query: 'code', selected_word: 'code' },
      { query: 'web', selected_word: 'website' },
    ];

    for (const search of sampleSearches) {
      const wordResult = await db.query('SELECT id FROM words WHERE word = $1', [search.selected_word]);
      
      if (wordResult.rows.length > 0) {
        const wordId = wordResult.rows[0]!.id;
        
        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
          const randomDaysAgo = Math.floor(Math.random() * 30);
          const timestamp = new Date();
          timestamp.setDate(timestamp.getDate() - randomDaysAgo);
          
          await db.query(`
            INSERT INTO search_logs (query_text, result_count, selected_word_id, response_time_ms, created_at)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            search.query,
            Math.floor(Math.random() * 10) + 1, 
            wordId,
            Math.floor(Math.random() * 50) + 10, 
            timestamp
          ]);
        }
      }
    }

    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM words) as word_count,
        (SELECT COUNT(*) FROM search_logs) as log_count,
        (SELECT AVG(freq) FROM words) as avg_frequency,
        (SELECT COUNT(DISTINCT category) FROM words WHERE category IS NOT NULL) as category_count
    `);

    const { word_count, log_count, avg_frequency, category_count } = stats.rows[0]!;

    console.log(`
 Database seeding completed successfully!

 Final Statistics:
   - Words: ${word_count}
   - Search logs: ${log_count}
   - Average frequency: ${parseFloat(avg_frequency).toFixed(2)}
   - Categories: ${category_count}

 The database is now ready for the Smart Autocomplete Search System!
    `);

    console.log('🔍 Testing data integrity...');
    
    const testQueries = ['hello', 'programming', 'javascript'];
    for (const query of testQueries) {
      const result = await db.query('SELECT word, freq, category FROM words WHERE word = $1', [query]);
      if (result.rows.length > 0) {
        const word = result.rows[0]!;
        console.log(`   ✓ ${word.word} (freq: ${word.freq}, category: ${word.category || 'none'})`);
      }
    }

  } catch (error) {
    console.error(' Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log(' Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error(' Seeding script failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
