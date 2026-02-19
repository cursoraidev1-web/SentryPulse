/**
 * API integration tests for SentryPulse backend.
 * Requires: database migrated and seeded (npm run migrate && npm run seed).
 * Run: npm test
 */
import request from 'supertest';
import app from '../index';

const API = '/api';

describe('SentryPulse API', () => {
  let token: string;
  let teamId: number;

  describe('System', () => {
    it('GET /api/health returns 200 and status ok', async () => {
      const res = await request(app).get(`${API}/health`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('Auth', () => {
    it('POST /api/auth/login with valid credentials returns token and user', async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: 'admin@sentrypulse.com', password: 'password' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('admin@sentrypulse.com');
      token = res.body.data.token;
    });

    it('POST /api/auth/login with invalid credentials returns 401', async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: 'admin@sentrypulse.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('GET /api/auth/me with valid token returns user', async () => {
      expect(token).toBeDefined();
      const res = await request(app)
        .get(`${API}/auth/me`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      const user = res.body.data?.user || res.body.data;
      expect(user.email).toBe('admin@sentrypulse.com');
    });

    it('GET /api/auth/me without token returns 401', async () => {
      const res = await request(app).get(`${API}/auth/me`);
      expect(res.status).toBe(401);
    });
  });

  describe('Teams', () => {
    it('GET /api/teams returns list of teams', async () => {
      const res = await request(app)
        .get(`${API}/teams`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        teamId = res.body.data[0].id;
      }
    });
  });

  describe('Monitors', () => {
    it('GET /api/monitors with team_id returns list', async () => {
      if (!teamId) return;
      const res = await request(app)
        .get(`${API}/monitors?team_id=${teamId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data) || res.body.data?.monitors !== undefined).toBe(true);
    });
  });

  describe('Incidents', () => {
    it('GET /api/incidents with team_id returns list', async () => {
      if (!teamId) return;
      const res = await request(app)
        .get(`${API}/incidents?team_id=${teamId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('Analytics', () => {
    it('GET /api/analytics/sites with team_id returns list', async () => {
      if (!teamId) return;
      const res = await request(app)
        .get(`${API}/analytics/sites?team_id=${teamId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('Status Pages', () => {
    it('GET /api/status-pages with team_id returns list', async () => {
      if (!teamId) return;
      const res = await request(app)
        .get(`${API}/status-pages?team_id=${teamId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/status/:slug (public) returns status page', async () => {
      const res = await request(app).get(`${API}/status/public-status`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('monitors');
    });
  });

  describe('404', () => {
    it('GET /api/unknown returns 404', async () => {
      const res = await request(app).get(`${API}/unknown`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
