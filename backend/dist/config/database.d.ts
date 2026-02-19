import mysql from 'mysql2/promise';
export declare const getPool: () => mysql.Pool;
export declare const query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
export declare const queryOne: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
export declare const execute: (sql: string, params?: any[]) => Promise<void>;
export declare const insert: (sql: string, params?: any[]) => Promise<number>;
//# sourceMappingURL=database.d.ts.map