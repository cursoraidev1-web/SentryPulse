import mysql from 'mysql2/promise';
import { config } from './env';

let pool: mysql.Pool;

export const getPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
};

export const query = async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
};

export const queryOne = async <T = any>(sql: string, params?: any[]): Promise<T | null> => {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
};

export const execute = async (sql: string, params?: any[]): Promise<void> => {
  await getPool().execute(sql, params);
};

export const insert = async (sql: string, params?: any[]): Promise<number> => {
  const [result] = await getPool().execute(sql, params);
  return (result as any).insertId;
};
