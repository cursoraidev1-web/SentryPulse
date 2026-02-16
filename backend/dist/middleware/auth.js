"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const AuthService_1 = require("../services/AuthService");
const authService = new AuthService_1.AuthService();
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const user = await authService.validateToken(token);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }
};
exports.auth = auth;
//# sourceMappingURL=auth.js.map