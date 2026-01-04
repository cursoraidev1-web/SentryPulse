import { SiteRepository } from '../repositories/SiteRepository.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { UsageTrackingService } from '../services/UsageTrackingService.js';
import { db } from '../core/database.js';

const siteRepository = new SiteRepository();
const analyticsService = new AnalyticsService();

export const sites = async (req, res, next) => {
  try {
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { team_id: 'Team ID is required' }
      });
    }

    const sites = await siteRepository.findByTeam(parseInt(team_id));

    res.json({
      success: true,
      data: {
        sites: sites.map(s => s.toArray())
      }
    });
  } catch (error) {
    next(error);
  }
};

export const showSite = async (req, res, next) => {
  try {
    const site = await siteRepository.findById(parseInt(req.params.id));

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    res.json({
      success: true,
      data: { site: site.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const createSite = async (req, res, next) => {
  try {
    const { team_id, name, domain } = req.body;

    if (!team_id || !name || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: {
          team_id: team_id ? undefined : 'Team ID is required',
          name: name ? undefined : 'Site name is required',
          domain: domain ? undefined : 'Domain is required'
        }
      });
    }

    const site = await siteRepository.create(req.body);

    // Track usage (sites don't have limits, but we track for analytics)
    const { UsageTrackingService } = await import('../services/UsageTrackingService.js');
    const usageService = new UsageTrackingService();
    await usageService.recordUsage(req.body.team_id, 'analytics_sites', 1);

    res.status(201).json({
      success: true,
      data: { site: site.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSite = async (req, res, next) => {
  try {
    const site = await siteRepository.findById(parseInt(req.params.id));

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    await siteRepository.update(parseInt(req.params.id), req.body);
    const updatedSite = await siteRepository.findById(parseInt(req.params.id));

    res.json({
      success: true,
      data: { site: updatedSite.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSite = async (req, res, next) => {
  try {
    const site = await siteRepository.findById(parseInt(req.params.id));

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    await siteRepository.delete(parseInt(req.params.id));

    res.json({
      success: true,
      message: 'Site deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const stats = async (req, res, next) => {
  try {
    const startDate = req.query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const endDate = req.query.end_date || new Date().toISOString().slice(0, 10);

    const site = await siteRepository.findById(parseInt(req.params.id));

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    const pageviews = await analyticsService.getPageviewStats(parseInt(req.params.id), startDate, endDate);
    const topPages = await analyticsService.getTopPages(parseInt(req.params.id), startDate, endDate);
    const topReferrers = await analyticsService.getTopReferrers(parseInt(req.params.id), startDate, endDate);

    res.json({
      success: true,
      data: {
        pageviews,
        top_pages: topPages,
        top_referrers: topReferrers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const collect = async (req, res, next) => {
  try {
    const { tracking_code, event_name } = req.body;

    if (!tracking_code) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { tracking_code: 'Tracking code is required' }
      });
    }

    const data = {
      ...req.body,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    };

    // Get site to track usage
    const site = await siteRepository.findByTrackingCode(tracking_code);
    
    if (event_name) {
      await analyticsService.recordEvent(tracking_code, data);
    } else {
      await analyticsService.recordPageview(tracking_code, data);
      
      // Track pageview usage
      if (site) {
        const { UsageTrackingService } = await import('../services/UsageTrackingService.js');
        const usageService = new UsageTrackingService();
        await usageService.recordUsage(site.team_id, 'pageviews', 1);
      }
    }

    res.json({
      success: true,
      message: 'Recorded'
    });
  } catch (error) {
    next(error);
  }
};





