import { Request, Response } from 'express';
import { StatusPageRepository } from '../repositories/StatusPageRepository';
import { getPool } from '../config/database';
import slugify from 'slugify';

export class StatusPageController {
  private repo = new StatusPageRepository();

  // GET /api/status-pages?team_id=1
  index = async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.query.team_id);
      if (!teamId) return res.status(400).json({ message: 'Team ID required' });
      const userId = (req as any).user?.id;
      const pool = getPool();
      const [membership]: any = await pool.query(
        'SELECT 1 FROM team_users WHERE team_id = ? AND user_id = ?',
        [teamId, userId]
      );
      if (membership.length === 0) return res.status(403).json({ message: 'Not a member of this team' });
      const pages = await this.repo.findByTeam(teamId);
      res.json({ success: true, data: pages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // GET /api/status-pages/:id
  show = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const page = await this.repo.findById(id);
      if (!page) return res.status(404).json({ message: 'Status page not found' });
      const userId = (req as any).user?.id;
      const pool = getPool();
      const [membership]: any = await pool.query(
        'SELECT 1 FROM team_users WHERE team_id = ? AND user_id = ?',
        [page.team_id, userId]
      );
      if (membership.length === 0) return res.status(403).json({ message: 'Not a member of this team' });
      const monitors = await this.repo.getMonitors(id);
      res.json({ success: true, data: { ...page, monitors } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // GET /api/status/:slug (public, no auth)
  getBySlug = async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const page = await this.repo.findBySlug(slug);
      if (!page) return res.status(404).json({ message: 'Status page not found' });
      const monitors = await this.repo.getMonitors(page.id);
      res.json({ success: true, data: { ...page, monitors } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // POST /api/status-pages
  store = async (req: Request, res: Response) => {
    try {
      const { team_id, name, domain, is_public } = req.body;
      if (!team_id || !name) return res.status(400).json({ message: 'Team ID and name required' });
      const userId = (req as any).user?.id;
      const pool = getPool();
      const [membership]: any = await pool.query(
        'SELECT role FROM team_users WHERE team_id = ? AND user_id = ?',
        [team_id, userId]
      );
      if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      let slug = slugify(name, { lower: true, strict: true });
      const [existing]: any = await pool.query('SELECT id FROM status_pages WHERE slug = ?', [slug]);
      if (existing.length > 0) slug = `${slug}-${Date.now().toString(36)}`;
      const page = await this.repo.create({ team_id, name, slug, domain, is_public });
      res.status(201).json({ success: true, data: page });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // PUT /api/status-pages/:id
  update = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const page = await this.repo.findById(id);
      if (!page) return res.status(404).json({ message: 'Status page not found' });
      const userId = (req as any).user?.id;
      const pool = getPool();
      const [membership]: any = await pool.query(
        'SELECT role FROM team_users WHERE team_id = ? AND user_id = ?',
        [page.team_id, userId]
      );
      if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      const { name, slug, domain, is_public } = req.body;
      await this.repo.update(id, { name, slug, domain, is_public });
      const updated = await this.repo.findById(id);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // DELETE /api/status-pages/:id
  destroy = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const page = await this.repo.findById(id);
      if (!page) return res.status(404).json({ message: 'Status page not found' });
      const userId = (req as any).user?.id;
      const pool = getPool();
      const [membership]: any = await pool.query(
        'SELECT role FROM team_users WHERE team_id = ? AND user_id = ?',
        [page.team_id, userId]
      );
      if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      await this.repo.delete(id);
      res.json({ success: true, message: 'Status page deleted' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // POST /api/status-pages/:id/monitors
  addMonitor = async (req: Request, res: Response) => {
    try {
      const statusPageId = Number(req.params.id);
      const { monitor_id } = req.body;
      if (!monitor_id) return res.status(400).json({ message: 'monitor_id required' });
      const page = await this.repo.findById(statusPageId);
      if (!page) return res.status(404).json({ message: 'Status page not found' });
      const userId = (req as any).user?.id;
      const pool = getPool();
      const [membership]: any = await pool.query(
        'SELECT 1 FROM team_users WHERE team_id = ? AND user_id = ?',
        [page.team_id, userId]
      );
      if (membership.length === 0) return res.status(403).json({ message: 'Not a member of this team' });
      await this.repo.addMonitor(statusPageId, monitor_id);
      res.json({ success: true, message: 'Monitor added' });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Monitor already on this page' });
      res.status(500).json({ message: error.message });
    }
  };

  // DELETE /api/status-pages/:id/monitors/:monitorId
  removeMonitor = async (req: Request, res: Response) => {
    try {
      const statusPageId = Number(req.params.id);
      const monitorId = Number(req.params.monitorId);
      const page = await this.repo.findById(statusPageId);
      if (!page) return res.status(404).json({ message: 'Status page not found' });
      const userId = (req as any).user?.id;
      const pool = getPool();
      const [membership]: any = await pool.query(
        'SELECT 1 FROM team_users WHERE team_id = ? AND user_id = ?',
        [page.team_id, userId]
      );
      if (membership.length === 0) return res.status(403).json({ message: 'Not a member of this team' });
      await this.repo.removeMonitor(statusPageId, monitorId);
      res.json({ success: true, message: 'Monitor removed' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}
