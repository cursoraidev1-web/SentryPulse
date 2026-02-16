"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashString = exports.now = exports.comparePassword = exports.hashPassword = exports.uuid = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uuid = () => {
    return crypto_1.default.randomUUID();
};
exports.uuid = uuid;
const hashPassword = async (password) => {
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
    return bcrypt.hash(password, 10);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
    return bcrypt.compare(password, hash);
};
exports.comparePassword = comparePassword;
const now = () => {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
};
exports.now = now;
const hashString = (str) => {
    return crypto_1.default.createHash('sha256').update(str).digest('hex');
};
exports.hashString = hashString;
//# sourceMappingURL=helpers.js.map