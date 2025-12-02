import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { MonitorController } from '../controllers/MonitorController';
import { auth } from '../middleware/auth';

const router = Router();

// Auth routes
const authController = new AuthController();
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.me.bind(authController));
router.put('/auth/profile', auth, authController.updateProfile.bind(authController));

// Monitor routes
const monitorController = new MonitorController();
router.get('/monitors', auth, monitorController.index);
router.get('/monitors/:id', auth, monitorController.show);
router.post('/monitors', auth, monitorController.store);
router.put('/monitors/:id', auth, monitorController.update);
router.delete('/monitors/:id', auth, monitorController.destroy);
router.get('/monitors/:id/checks', auth, monitorController.checks);
router.post('/monitors/:id/check', auth, monitorController.runCheck);

// Analytics collect endpoint (public)
router.post('/analytics/collect', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Recorded',
    });
  } catch (error: any) {
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

export default router;
