
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { DatabaseConfig } from '@/types';

class Database {
  private pool: Pool;
  private static instance: Database;

  private constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      connectionString: config.connectionString,
      ssl: { rejectUnauthorized: false }, 
      max: 20, 
      idleTimeoutMillis: 30000, 
      connectionTimeoutMillis: 10000, 
      query_timeout: 30000, 
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

 
  public static getInstance(config?: DatabaseConfig): Database {
    if (!Database.instance) {
      if (!config) {
        throw new Error('Database config required for first initialization');
      }
      Database.instance = new Database(config);
    }
    return Database.instance;
  }

  
  public async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      if (process.env['NODE_ENV'] === 'development') {
        console.log('Executed query', { text, duration, rows: result.rowCount });
      }
      
      return result;
    } catch (error) {
      console.error('Database query error:', { text, params, error });
      throw error;
    }
  }

  
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

 
  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

 
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      console.log('Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

 
  public async close(): Promise<void> {
    await this.pool.end();
  }

  
  public getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

export const getDatabase = (config?: DatabaseConfig) => Database.getInstance(config);

export { Database };
