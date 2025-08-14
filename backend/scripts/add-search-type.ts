

import dotenv from 'dotenv';
import { getDatabase } from '../src/utils/database';

dotenv.config();

async function addSearchTypeColumn() {
  const db = getDatabase({
    connectionString: process.env['DATABASE_URL']!,
    ssl: true,
  });

  console.log(' Adding search_type column to search_logs table...');

  try {
    await db.testConnection();

    await db.query(`
      ALTER TABLE search_logs 
      ADD COLUMN IF NOT EXISTS search_type VARCHAR(20) DEFAULT 'exact';
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_search_logs_search_type ON search_logs(search_type);
    `);

    console.log(' Successfully added search_type column and index!');
    
  } catch (error) {
    console.error(' Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addSearchTypeColumn()
    .then(() => {
      console.log(' Search type migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error(' Search type migration failed:', error);
      process.exit(1);
    });
}

export { addSearchTypeColumn };
