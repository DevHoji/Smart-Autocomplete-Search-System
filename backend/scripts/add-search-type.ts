/**
 * Migration script to add search_type column to search_logs table
 * This enables tracking of fuzzy vs exact searches
 */

import dotenv from 'dotenv';
import { getDatabase } from '../src/utils/database';

// Load environment variables
dotenv.config();

async function addSearchTypeColumn() {
  const db = getDatabase({
    connectionString: process.env['DATABASE_URL']!,
    ssl: true,
  });

  console.log('🔄 Adding search_type column to search_logs table...');

  try {
    // Test connection
    await db.testConnection();

    // Add search_type column if it doesn't exist
    await db.query(`
      ALTER TABLE search_logs 
      ADD COLUMN IF NOT EXISTS search_type VARCHAR(20) DEFAULT 'exact';
    `);

    // Create index for the new column
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_search_logs_search_type ON search_logs(search_type);
    `);

    console.log('✅ Successfully added search_type column and index!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  addSearchTypeColumn()
    .then(() => {
      console.log('🎉 Search type migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Search type migration failed:', error);
      process.exit(1);
    });
}

export { addSearchTypeColumn };
