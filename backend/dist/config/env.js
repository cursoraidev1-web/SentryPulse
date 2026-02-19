"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '8000', 10),
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        name: process.env.DB_NAME || 'sentrypulse',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'change-this-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    mail: {
        host: process.env.MAIL_HOST || 'localhost',
        port: parseInt(process.env.MAIL_PORT || '1025', 10),
        user: process.env.MAIL_USER || '',
        password: process.env.MAIL_PASSWORD || '',
        from: process.env.MAIL_FROM || 'noreply@sentrypulse.com',
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    },
    whatsapp: {
        apiUrl: process.env.WHATSAPP_API_URL || '',
        apiKey: process.env.WHATSAPP_API_KEY || '',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
};
//# sourceMappingURL=env.js.map