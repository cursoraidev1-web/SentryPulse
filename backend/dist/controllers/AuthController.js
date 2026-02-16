"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const authService = new AuthService_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: {
                        name: !name ? 'Name is required' : undefined,
                        email: !email ? 'Email is required' : undefined,
                        password: !password ? 'Password is required' : undefined,
                    },
                });
            }
            if (password.length < 8) {
                return res.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: { password: 'Password must be at least 8 characters' },
                });
            }
            const result = await authService.register({ name, email, password });
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: {
                        email: !email ? 'Email is required' : undefined,
                        password: !password ? 'Password is required' : undefined,
                    },
                });
            }
            const result = await authService.login(email, password);
            res.json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message,
            });
        }
    }
    async me(req, res) {
        try {
            const { password, ...user } = req.user;
            res.json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    async updateProfile(req, res) {
        try {
            const { name, avatar, timezone } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (avatar !== undefined)
                updateData.avatar = avatar;
            if (timezone)
                updateData.timezone = timezone;
            const user = await authService.updateProfile(req.user.id, updateData);
            res.json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map