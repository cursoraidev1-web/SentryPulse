import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

// Auth routes
import * as authController from '../controllers/authController.js';

// Other controllers
import * as teamController from '../controllers/teamController.js';
import * as monitorController from '../controllers/monitorController.js';
import * as incidentController from '../controllers/incidentController.js';
import * as analyticsController from '../controllers/analyticsController.js';
import * as statusPageController from '../controllers/statusPageController.js';

const router = express.Router();

// Auth routes (no auth required for register/login)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.me);
router.post('/auth/refresh', authController.refresh);
router.put('/auth/profile', authMiddleware, authController.updateProfile);

// Team routes (require auth)
router.get('/teams', authMiddleware, teamController.index);
router.get('/teams/:id', authMiddleware, teamController.show);
router.post('/teams', authMiddleware, teamController.store);
router.put('/teams/:id', authMiddleware, teamController.update);
router.post('/teams/:id/members', authMiddleware, teamController.addMember);
router.delete('/teams/:id/members/:userId', authMiddleware, teamController.removeMember);

// Monitor routes (require auth)
router.get('/monitors', authMiddleware, monitorController.index);
router.get('/monitors/:id', authMiddleware, monitorController.show);
router.post('/monitors', authMiddleware, monitorController.store);
router.put('/monitors/:id', authMiddleware, monitorController.update);
router.delete('/monitors/:id', authMiddleware, monitorController.destroy);
router.get('/monitors/:id/checks', authMiddleware, monitorController.checks);
router.post('/monitors/:id/check', authMiddleware, monitorController.runCheck);

// Incident routes (require auth)
router.get('/incidents', authMiddleware, incidentController.index);
router.get('/incidents/:id', authMiddleware, incidentController.show);
router.put('/incidents/:id', authMiddleware, incidentController.update);
router.post('/incidents/:id/resolve', authMiddleware, incidentController.resolve);
router.get('/monitors/:monitorId/incidents', authMiddleware, incidentController.monitorIncidents);

// Status page routes
router.get('/status-pages', authMiddleware, statusPageController.index);
router.get('/status-pages/:id', authMiddleware, statusPageController.show);
router.get('/status/:slug', statusPageController.showBySlug); // Public route
router.post('/status-pages', authMiddleware, statusPageController.store);
router.put('/status-pages/:id', authMiddleware, statusPageController.update);
router.delete('/status-pages/:id', authMiddleware, statusPageController.destroy);
router.post('/status-pages/:id/monitors', authMiddleware, statusPageController.addMonitor);
router.delete('/status-pages/:id/monitors/:monitorId', authMiddleware, statusPageController.removeMonitor);

// User routes
import * as userController from '../controllers/userController.js';
router.get('/users/search', authMiddleware, userController.search);

// Analytics routes
router.get('/analytics/sites', authMiddleware, analyticsController.sites);
router.get('/analytics/sites/:id', authMiddleware, analyticsController.showSite);
router.post('/analytics/sites', authMiddleware, analyticsController.createSite);
router.put('/analytics/sites/:id', authMiddleware, analyticsController.updateSite);
router.delete('/analytics/sites/:id', authMiddleware, analyticsController.deleteSite);
router.get('/analytics/sites/:id/stats', authMiddleware, analyticsController.stats);
router.post('/analytics/collect', analyticsController.collect); // Public route for tracking

// Upload routes
import * as uploadController from '../controllers/uploadController.js';
router.post('/upload/avatar', authMiddleware, uploadController.uploadAvatarMiddleware, uploadController.uploadAvatar);
router.post('/upload/logo', authMiddleware, uploadController.uploadLogoMiddleware, uploadController.uploadLogo);

// Notification channel routes
import * as notificationChannelController from '../controllers/notificationChannelController.js';
router.get('/notification-channels', authMiddleware, notificationChannelController.index);
router.get('/notification-channels/:id', authMiddleware, notificationChannelController.show);
router.post('/notification-channels', authMiddleware, notificationChannelController.create);
router.put('/notification-channels/:id', authMiddleware, notificationChannelController.update);
router.delete('/notification-channels/:id', authMiddleware, notificationChannelController.destroy);

// Billing routes
import * as billingController from '../controllers/billingController.js';
router.post('/billing/plan', authMiddleware, billingController.updatePlan);
router.get('/billing/usage', authMiddleware, billingController.getUsage);

// API Key routes
import * as apiKeyController from '../controllers/apiKeyController.js';
router.get('/api-keys', authMiddleware, apiKeyController.index);
router.post('/api-keys', authMiddleware, apiKeyController.create);
router.delete('/api-keys/:id', authMiddleware, apiKeyController.destroy);

export default router;



