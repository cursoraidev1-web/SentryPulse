import { db } from '../core/database.js';
import { now } from '../core/helpers.js';

const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const index = async (req, res, next) => {
  try {
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { team_id: 'Team ID is required' }
      });
    }

    const statusPages = await db.query(
      'SELECT * FROM status_pages WHERE team_id = ? ORDER BY created_at DESC',
      [parseInt(team_id)]
    );

    res.json({
      success: true,
      data: { status_pages: statusPages }
    });
  } catch (error) {
    next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const statusPage = await db.queryOne(
      'SELECT * FROM status_pages WHERE id = ?',
      [parseInt(req.params.id)]
    );

    if (!statusPage) {
      return res.status(404).json({
        success: false,
        message: 'Status page not found'
      });
    }

    const monitors = await db.query(
      `SELECT m.*, spm.display_order 
       FROM monitors m
       INNER JOIN status_page_monitors spm ON m.id = spm.monitor_id
       WHERE spm.status_page_id = ?
       ORDER BY spm.display_order ASC`,
      [parseInt(req.params.id)]
    );

    statusPage.monitors = monitors;

    res.json({
      success: true,
      data: { status_page: statusPage }
    });
  } catch (error) {
    next(error);
  }
};

export const showBySlug = async (req, res, next) => {
  try {
    const statusPage = await db.queryOne(
      'SELECT * FROM status_pages WHERE slug = ?',
      [req.params.slug]
    );

    if (!statusPage || !statusPage.is_public) {
      return res.status(404).json({
        success: false,
        message: 'Status page not found'
      });
    }

    const monitors = await db.query(
      `SELECT m.*, spm.display_order 
       FROM monitors m
       INNER JOIN status_page_monitors spm ON m.id = spm.monitor_id
       WHERE spm.status_page_id = ?
       ORDER BY spm.display_order ASC`,
      [statusPage.id]
    );

    statusPage.monitors = monitors;

    res.json({
      success: true,
      data: { status_page: statusPage }
    });
  } catch (error) {
    next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const { team_id, name } = req.body;

    if (!team_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: {
          team_id: team_id ? undefined : 'Team ID is required',
          name: name ? undefined : 'Name is required'
        }
      });
    }

    let slug = generateSlug(name);
    const existing = await db.queryOne('SELECT id FROM status_pages WHERE slug = ?', [slug]);
    if (existing) {
      slug += '-' + Date.now().toString().slice(-5);
    }

    const id = await db.insert(
      `INSERT INTO status_pages (team_id, name, slug, is_public, theme, custom_css, custom_html, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(team_id),
        name,
        slug,
        req.body.is_public !== undefined ? req.body.is_public : true,
        req.body.theme ? JSON.stringify(req.body.theme) : null,
        req.body.custom_css || null,
        req.body.custom_html || null,
        now(),
        now()
      ]
    );

    const statusPage = await db.queryOne('SELECT * FROM status_pages WHERE id = ?', [id]);

    // Track usage
    const { UsageTrackingService } = await import('../services/UsageTrackingService.js');
    const usageService = new UsageTrackingService();
    await usageService.recordUsage(parseInt(team_id), 'status_pages', 1);

    res.status(201).json({
      success: true,
      data: { status_page: statusPage }
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const statusPage = await db.queryOne(
      'SELECT * FROM status_pages WHERE id = ?',
      [parseInt(req.params.id)]
    );

    if (!statusPage) {
      return res.status(404).json({
        success: false,
        message: 'Status page not found'
      });
    }

    const allowedFields = ['name', 'is_public', 'logo_url', 'domain', 'custom_css', 'custom_html'];
    const fields = [];
    const params = [];

    for (const key of allowedFields) {
      if (key in req.body) {
        fields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }

    if ('theme' in req.body) {
      fields.push('theme = ?');
      params.push(JSON.stringify(req.body.theme));
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { data: 'No valid fields to update' }
      });
    }

    fields.push('updated_at = ?');
    params.push(now());
    params.push(parseInt(req.params.id));

    await db.execute(
      `UPDATE status_pages SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    const updatedStatusPage = await db.queryOne(
      'SELECT * FROM status_pages WHERE id = ?',
      [parseInt(req.params.id)]
    );

    res.json({
      success: true,
      data: { status_page: updatedStatusPage }
    });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const statusPage = await db.queryOne(
      'SELECT * FROM status_pages WHERE id = ?',
      [parseInt(req.params.id)]
    );

    if (!statusPage) {
      return res.status(404).json({
        success: false,
        message: 'Status page not found'
      });
    }

    await db.execute('DELETE FROM status_pages WHERE id = ?', [parseInt(req.params.id)]);

    res.json({
      success: true,
      message: 'Status page deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addMonitor = async (req, res, next) => {
  try {
    const { monitor_id } = req.body;

    if (!monitor_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { monitor_id: 'Monitor ID is required' }
      });
    }

    await db.insert(
      'INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order) VALUES (?, ?, ?)',
      [parseInt(req.params.id), parseInt(monitor_id), parseInt(req.body.display_order || 0)]
    );

    res.json({
      success: true,
      message: 'Monitor added to status page'
    });
  } catch (error) {
    next(error);
  }
};

export const removeMonitor = async (req, res, next) => {
  try {
    await db.execute(
      'DELETE FROM status_page_monitors WHERE status_page_id = ? AND monitor_id = ?',
      [parseInt(req.params.id), parseInt(req.params.monitorId)]
    );

    res.json({
      success: true,
      message: 'Monitor removed from status page'
    });
  } catch (error) {
    next(error);
  }
};





