"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insert = exports.execute = exports.queryOne = exports.query = exports.getPool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
let pool;
const getPool = () => {
    if (!pool) {
        pool = promise_1.default.createPool({
            host: env_1.config.db.host,
            port: env_1.config.db.port,
            user: env_1.config.db.user,
            password: env_1.config.db.password,
            database: env_1.config.db.name,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
    }
    return pool;
};
exports.getPool = getPool;
const query = async (sql, params) => {
    const [rows] = await (0, exports.getPool)().execute(sql, params);
    return rows;
};
exports.query = query;
const queryOne = async (sql, params) => {
    const rows = await (0, exports.query)(sql, params);
    return rows[0] || null;
};
exports.queryOne = queryOne;
const execute = async (sql, params) => {
    await (0, exports.getPool)().execute(sql, params);
};
exports.execute = execute;
const insert = async (sql, params) => {
    const [result] = await (0, exports.getPool)().execute(sql, params);
    return result.insertId;
};
exports.insert = insert;
//# sourceMappingURL=database.js.map