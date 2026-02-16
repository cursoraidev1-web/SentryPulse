"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserRepository_1 = require("../repositories/UserRepository");
const helpers_1 = require("../utils/helpers");
const env_1 = require("../config/env");
class AuthService {
    userRepository;
    constructor() {
        this.userRepository = new UserRepository_1.UserRepository();
    }
    async register(data) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }
        const hashedPassword = await (0, helpers_1.hashPassword)(data.password);
        const user = await this.userRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        });
        const token = this.generateToken(user);
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !(await (0, helpers_1.comparePassword)(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        await this.userRepository.updateLastLogin(user.id);
        const token = this.generateToken(user);
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async validateToken(token) {
        try {
            // Use fallback for secret here too just in case
            const secret = env_1.config.jwt.secret || 'default-secret-key';
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            return this.userRepository.findById(decoded.sub);
        }
        catch (error) {
            return null;
        }
    }
    generateToken(user) {
        const secret = env_1.config.jwt.secret || 'default-secret-key';
        const expiresIn = env_1.config.jwt.expiresIn || '7d';
        return jsonwebtoken_1.default.sign({
            sub: user.id,
            email: user.email,
        }, secret, 
        // We cast this object to jwt.SignOptions to solve the type mismatch
        { expiresIn: expiresIn });
    }
    async getUser(id) {
        return this.userRepository.findById(id);
    }
    async updateProfile(userId, data) {
        await this.userRepository.update(userId, data);
        const user = await this.userRepository.findById(userId);
        if (!user)
            throw new Error('User not found');
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map