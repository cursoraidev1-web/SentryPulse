import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TeamController } from '../controllers/TeamController';
import { MonitorController } from '../controllers/MonitorController';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { IncidentController } from '../controllers/IncidentController';
import { StatusPageController } from '../controllers/StatusPageController';
import { auth } from '../middleware/auth';

const router = Router();

// --- AUTH ROUTES ---
const authController = new AuthController();
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.me.bind(authController));
router.put('/auth/profile', auth, authController.updateProfile.bind(authController));

// --- TEAM ROUTES ---
const teamController = new TeamController();
router.get('/teams', auth, teamController.index.bind(teamController));
router.post('/teams', auth, teamController.store.bind(teamController));
router.get('/teams/:id', auth, teamController.show.bind(teamController));
router.put('/teams/:id', auth, teamController.update.bind(teamController));
router.delete('/teams/:id', auth, teamController.destroy.bind(teamController));
router.post('/teams/:id/members', auth, teamController.addMember.bind(teamController));
router.delete('/teams/:id/members/:userId', auth, teamController.removeMember.bind(teamController));

// --- MONITOR ROUTES ---
const monitorController = new MonitorController();
router.get('/monitors', auth, monitorController.index);
router.get('/monitors/:id', auth, monitorController.show);
router.post('/monitors', auth, monitorController.store);
router.put('/monitors/:id', auth, monitorController.update);
router.delete('/monitors/:id', auth, monitorController.destroy);
router.get('/monitors/:id/checks', auth, monitorController.checks);
router.post('/monitors/:id/check', auth, monitorController.runCheck);

// --- ANALYTICS ROUTES ---
const analyticsController = new AnalyticsController();

// Site Management
router.get('/analytics/sites', auth, analyticsController.getSites);
router.get('/analytics/site/:id', auth, analyticsController.getSite);
router.post('/analytics/sites', auth, analyticsController.createSite);
router.put('/analytics/sites/:id', auth, analyticsController.updateSite);
router.delete('/analytics/sites/:id', auth, analyticsController.deleteSite);

// ✅ 1. Collect Route (Records the visit)
router.post('/analytics/collect', analyticsController.collectEvent);

// ✅ 2. Pulse Route (Updates the duration - THIS WAS LIKELY MISSING)
router.post('/analytics/pulse', analyticsController.pulse);

// ✅ 3. Stats Route (For the Dashboard)
router.get('/analytics/sites/:id/stats', auth, analyticsController.getStats);


// --- INCIDENT ROUTES ---
const incidentController = new IncidentController();
router.get('/incidents', auth, incidentController.index);
router.get('/incidents/:id', auth, incidentController.show);
router.post('/incidents', auth, incidentController.store);
router.put('/incidents/:id', auth, incidentController.update);
router.post('/incidents/:id/resolve', auth, incidentController.resolve);

// --- STATUS PAGES ROUTES ---
const statusPageController = new StatusPageController();
router.get('/status-pages', auth, statusPageController.index);
router.get('/status-pages/:id', auth, statusPageController.show);
router.get('/status/:slug', statusPageController.getBySlug);
router.post('/status-pages', auth, statusPageController.store);
router.put('/status-pages/:id', auth, statusPageController.update);
router.delete('/status-pages/:id', auth, statusPageController.destroy);
router.post('/status-pages/:id/monitors', auth, statusPageController.addMonitor);
router.delete('/status-pages/:id/monitors/:monitorId', auth, statusPageController.removeMonitor);

// --- SYSTEM ROUTES ---
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
