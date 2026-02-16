"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const MonitorController_1 = require("../controllers/MonitorController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Auth routes
const authController = new AuthController_1.AuthController();
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth_1.auth, authController.me.bind(authController));
router.put('/auth/profile', auth_1.auth, authController.updateProfile.bind(authController));
// Monitor routes
const monitorController = new MonitorController_1.MonitorController();
router.get('/monitors', auth_1.auth, monitorController.index);
router.get('/monitors/:id', auth_1.auth, monitorController.show);
router.post('/monitors', auth_1.auth, monitorController.store);
router.put('/monitors/:id', auth_1.auth, monitorController.update);
router.delete('/monitors/:id', auth_1.auth, monitorController.destroy);
router.get('/monitors/:id/checks', auth_1.auth, monitorController.checks);
router.post('/monitors/:id/check', auth_1.auth, monitorController.runCheck);
// Analytics collect endpoint (public)
router.post('/analytics/collect', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Recorded',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=index.js.map