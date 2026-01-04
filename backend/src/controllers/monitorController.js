import { MonitorRepository } from '../repositories/MonitorRepository.js';
import { MonitoringService } from '../services/MonitoringService.js';
import { UsageTrackingService } from '../services/UsageTrackingService.js';
import validator from 'validator';

const monitorRepository = new MonitorRepository();
const monitoringService = new MonitoringService();

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

    const monitors = await monitorRepository.findByTeam(parseInt(team_id));

    res.json({
      success: true,
      data: {
        monitors: monitors.map(m => m.toArray())
      }
    });
  } catch (error) {
    next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const monitor = await monitorRepository.findById(parseInt(req.params.id));

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    res.json({
      success: true,
      data: { monitor: monitor.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const { team_id, name, url } = req.body;

    if (!team_id || !name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: {
          team_id: team_id ? undefined : 'Team ID is required',
          name: name ? undefined : 'Name is required',
          url: url ? undefined : 'URL is required'
        }
      });
    }

    if (!validator.isURL(url)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { url: 'Invalid URL format' }
      });
    }

    const monitor = await monitorRepository.create(req.body);

    // Track usage
    const { UsageTrackingService } = await import('../services/UsageTrackingService.js');
    const usageService = new UsageTrackingService();
    await usageService.recordUsage(req.body.team_id, 'monitors', 1);

    res.status(201).json({
      success: true,
      data: { monitor: monitor.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const monitor = await monitorRepository.findById(parseInt(req.params.id));

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    if (req.body.url && !validator.isURL(req.body.url)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { url: 'Invalid URL format' }
      });
    }

    await monitorRepository.update(parseInt(req.params.id), req.body);
    const updatedMonitor = await monitorRepository.findById(parseInt(req.params.id));

    res.json({
      success: true,
      data: { monitor: updatedMonitor.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const monitor = await monitorRepository.findById(parseInt(req.params.id));

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    await monitorRepository.delete(parseInt(req.params.id));

    res.json({
      success: true,
      message: 'Monitor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const checks = async (req, res, next) => {
  try {
    const monitor = await monitorRepository.findById(parseInt(req.params.id));

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    const limit = parseInt(req.query.limit || 100);
    const checkResults = await monitorRepository.getChecks(parseInt(req.params.id), limit);

    res.json({
      success: true,
      data: { checks: checkResults }
    });
  } catch (error) {
    next(error);
  }
};

export const runCheck = async (req, res, next) => {
  try {
    const monitor = await monitorRepository.findById(parseInt(req.params.id));

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    const result = await monitoringService.checkMonitor(monitor);

    res.json({
      success: true,
      data: { result }
    });
  } catch (error) {
    next(error);
  }
};





