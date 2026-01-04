import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

class Database {
  constructor() {
    this.pool = null;
    this.client = null;
  }

  connect() {
    if (this.pool) {
      return this.pool;
    }

    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'sentrypulse',
      max: 10, // connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    return this.pool;
  }

  async query(sql, params = []) {
    if (!this.pool) {
      this.connect();
    }

    // Convert MySQL-style placeholders (?) to PostgreSQL ($1, $2, etc.)
    if (sql.includes('?')) {
      let paramIndex = 1;
      sql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    }

    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async queryOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async execute(sql, params = []) {
    if (!this.pool) {
      this.connect();
    }

    // Convert MySQL-style placeholders (?) to PostgreSQL ($1, $2, etc.)
    if (sql.includes('?')) {
      let paramIndex = 1;
      sql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    }

    const result = await this.pool.query(sql, params);
    return result;
  }

  async insert(sql, params = []) {
    if (!this.pool) {
      this.connect();
    }

    // Convert MySQL-style placeholders (?) to PostgreSQL ($1, $2, etc.)
    if (sql.includes('?')) {
      let paramIndex = 1;
      sql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    }

    // For INSERT queries, append RETURNING id to get the inserted ID (if not already present)
    if (sql.toUpperCase().startsWith('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
      sql = sql + ' RETURNING id';
    }

    const result = await this.pool.query(sql, params);
    
    // Return the id from RETURNING clause
    if (result.rows && result.rows.length > 0 && result.rows[0].id) {
      return result.rows[0].id;
    }
    
    // Fallback: return rowCount if no id column
    return result.rowCount > 0 ? result.rowCount : null;
  }

  async beginTransaction() {
    if (!this.client) {
      this.client = await this.pool.connect();
    }
    await this.client.query('BEGIN');
  }

  async commit() {
    if (this.client) {
      await this.client.query('COMMIT');
      this.client.release();
      this.client = null;
    }
  }

  async rollback() {
    if (this.client) {
      await this.client.query('ROLLBACK');
      this.client.release();
      this.client = null;
    }
  }

  async close() {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const db = new Database();
db.connect();
