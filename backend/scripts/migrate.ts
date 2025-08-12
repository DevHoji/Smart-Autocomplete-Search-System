/**
 * Database migration script for Smart Autocomplete Search System
 * Creates the necessary tables for storing words and analytics data
 */

import dotenv from 'dotenv';
import { getDatabase } from '../src/utils/database';

// Load environment variables
dotenv.config();

async function createTables() {
  const db = getDatabase({
    connectionString: process.env['DATABASE_URL']!,
    ssl: true, // Always use SSL for Neon
  });

  console.log('🔄 Starting database migration...');

  try {
    // Test connection
    await db.testConnection();

    // Create words table
    console.log('📝 Creating words table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS words (
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) UNIQUE NOT NULL,
        freq INTEGER NOT NULL DEFAULT 1,
        category VARCHAR(100),
        synonyms TEXT[],
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_selected TIMESTAMP WITH TIME ZONE
      );
    `);

    // Create indexes for better performance
    console.log('🔍 Creating indexes...');
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
      CREATE INDEX IF NOT EXISTS idx_words_freq ON words(freq DESC);
      CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
      CREATE INDEX IF NOT EXISTS idx_words_updated_at ON words(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_words_last_selected ON words(last_selected DESC);
    `);

    // Create search_logs table for analytics
    console.log('📊 Creating search_logs table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS search_logs (
        id SERIAL PRIMARY KEY,
        query_text VARCHAR(255),
        user_id VARCHAR(100),
        result_count INTEGER NOT NULL DEFAULT 0,
        selected_word_id INTEGER REFERENCES words(id),
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for search_logs
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_search_logs_query_text ON search_logs(query_text);
      CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_search_logs_selected_word_id ON search_logs(selected_word_id);
    `);

    // Create trigger to update updated_at timestamp
    console.log('⚡ Creating triggers...');
    await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS update_words_updated_at ON words;
      CREATE TRIGGER update_words_updated_at
        BEFORE UPDATE ON words
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create view for analytics
    console.log('📈 Creating analytics views...');
    await db.query(`
      CREATE OR REPLACE VIEW word_analytics AS
      SELECT 
        w.id,
        w.word,
        w.freq,
        w.category,
        w.created_at,
        w.updated_at,
        w.last_selected,
        COUNT(sl.id) as search_count,
        COUNT(CASE WHEN sl.selected_word_id IS NOT NULL THEN 1 END) as selection_count
      FROM words w
      LEFT JOIN search_logs sl ON w.id = sl.selected_word_id
      GROUP BY w.id, w.word, w.freq, w.category, w.created_at, w.updated_at, w.last_selected;
    `);

    console.log('✅ Database migration completed successfully!');
    
    // Display table information
    const wordsCount = await db.query('SELECT COUNT(*) FROM words');
    const logsCount = await db.query('SELECT COUNT(*) FROM search_logs');
    
    console.log(`📊 Current data:
    - Words: ${wordsCount.rows[0]?.count || 0}
    - Search logs: ${logsCount.rows[0]?.count || 0}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { createTables };
