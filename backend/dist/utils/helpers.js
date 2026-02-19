"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashString = exports.now = exports.comparePassword = exports.hashPassword = exports.uuid = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const uuid = () => {
    return crypto_1.default.randomUUID();
};
exports.uuid = uuid;
const hashPassword = async (password) => {
    // 10 is the number of salt rounds
    return bcryptjs_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const now = () => {
    // Returns 'YYYY-MM-DD HH:MM:SS' format for MySQL
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
};
exports.now = now;
const hashString = (str) => {
    return crypto_1.default.createHash('sha256').update(str).digest('hex');
};
exports.hashString = hashString;
//# sourceMappingURL=helpers.js.map