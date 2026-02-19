"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const TeamController_1 = require("../controllers/TeamController");
const MonitorController_1 = require("../controllers/MonitorController");
const AnalyticsController_1 = require("../controllers/AnalyticsController");
const IncidentController_1 = require("../controllers/IncidentController");
const StatusPageController_1 = require("../controllers/StatusPageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// --- AUTH ROUTES ---
const authController = new AuthController_1.AuthController();
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth_1.auth, authController.me.bind(authController));
router.put('/auth/profile', auth_1.auth, authController.updateProfile.bind(authController));
// --- TEAM ROUTES ---
const teamController = new TeamController_1.TeamController();
router.get('/teams', auth_1.auth, teamController.index.bind(teamController));
router.post('/teams', auth_1.auth, teamController.store.bind(teamController));
router.get('/teams/:id', auth_1.auth, teamController.show.bind(teamController));
router.put('/teams/:id', auth_1.auth, teamController.update.bind(teamController));
router.delete('/teams/:id', auth_1.auth, teamController.destroy.bind(teamController));
router.post('/teams/:id/members', auth_1.auth, teamController.addMember.bind(teamController));
router.delete('/teams/:id/members/:userId', auth_1.auth, teamController.removeMember.bind(teamController));
// --- MONITOR ROUTES ---
const monitorController = new MonitorController_1.MonitorController();
router.get('/monitors', auth_1.auth, monitorController.index);
router.get('/monitors/:id', auth_1.auth, monitorController.show);
router.post('/monitors', auth_1.auth, monitorController.store);
router.put('/monitors/:id', auth_1.auth, monitorController.update);
router.delete('/monitors/:id', auth_1.auth, monitorController.destroy);
router.get('/monitors/:id/checks', auth_1.auth, monitorController.checks);
router.post('/monitors/:id/check', auth_1.auth, monitorController.runCheck);
// --- ANALYTICS ROUTES ---
const analyticsController = new AnalyticsController_1.AnalyticsController();
// Site Management
router.get('/analytics/sites', auth_1.auth, analyticsController.getSites);
router.get('/analytics/site/:id', auth_1.auth, analyticsController.getSite);
router.post('/analytics/sites', auth_1.auth, analyticsController.createSite);
router.put('/analytics/sites/:id', auth_1.auth, analyticsController.updateSite);
router.delete('/analytics/sites/:id', auth_1.auth, analyticsController.deleteSite);
// ✅ 1. Collect Route (Records the visit)
router.post('/analytics/collect', analyticsController.collectEvent);
// ✅ 2. Pulse Route (Updates the duration - THIS WAS LIKELY MISSING)
router.post('/analytics/pulse', analyticsController.pulse);
// ✅ 3. Stats Route (For the Dashboard)
router.get('/analytics/sites/:id/stats', auth_1.auth, analyticsController.getStats);
// --- INCIDENT ROUTES ---
const incidentController = new IncidentController_1.IncidentController();
router.get('/incidents', auth_1.auth, incidentController.index);
router.get('/incidents/:id', auth_1.auth, incidentController.show);
router.post('/incidents', auth_1.auth, incidentController.store);
router.put('/incidents/:id', auth_1.auth, incidentController.update);
router.post('/incidents/:id/resolve', auth_1.auth, incidentController.resolve);
// --- STATUS PAGES ROUTES ---
const statusPageController = new StatusPageController_1.StatusPageController();
router.get('/status-pages', auth_1.auth, statusPageController.index);
router.get('/status-pages/:id', auth_1.auth, statusPageController.show);
router.get('/status/:slug', statusPageController.getBySlug);
router.post('/status-pages', auth_1.auth, statusPageController.store);
router.put('/status-pages/:id', auth_1.auth, statusPageController.update);
router.delete('/status-pages/:id', auth_1.auth, statusPageController.destroy);
router.post('/status-pages/:id/monitors', auth_1.auth, statusPageController.addMonitor);
router.delete('/status-pages/:id/monitors/:monitorId', auth_1.auth, statusPageController.removeMonitor);
// --- SYSTEM ROUTES ---
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=index.js.map