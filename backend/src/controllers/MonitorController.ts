import { Request, Response } from 'express';
import { MonitorRepository } from '../repositories/MonitorRepository';
import { MonitoringService } from '../services/MonitoringService';

const monitorRepository = new MonitorRepository();
const monitoringService = new MonitoringService();

export class MonitorController {
  async index(req: Request, res: Response) {
    try {
      const teamId = parseInt(req.query.team_id as string);

      if (!teamId) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: { team_id: 'Team ID is required' },
        });
      }

      const monitors = await monitorRepository.findByTeam(teamId);

      res.json({
        success: true,
        data: { monitors },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const monitor = await monitorRepository.findById(id);

      if (!monitor) {
        return res.status(404).json({
          success: false,
          message: 'Monitor not found',
        });
      }

      res.json({
        success: true,
        data: { monitor },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const { team_id, name, url, type, method, interval, timeout, check_ssl, check_keyword, expected_status_code } = req.body;

      if (!team_id || !name || !url) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: {
            team_id: !team_id ? 'Team ID is required' : undefined,
            name: !name ? 'Name is required' : undefined,
            url: !url ? 'URL is required' : undefined,
          },
        });
      }

      const monitor = await monitorRepository.create({
        team_id,
        name,
        url,
        type,
        method,
        interval,
        timeout,
        check_ssl,
        check_keyword,
        expected_status_code,
      });

      res.status(201).json({
        success: true,
        message: 'Resource created',
        data: { monitor },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const monitor = await monitorRepository.findById(id);

      if (!monitor) {
        return res.status(404).json({
          success: false,
          message: 'Monitor not found',
        });
      }

      await monitorRepository.update(id, req.body);
      const updatedMonitor = await monitorRepository.findById(id);

      res.json({
        success: true,
        data: { monitor: updatedMonitor },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async destroy(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const monitor = await monitorRepository.findById(id);

      if (!monitor) {
        return res.status(404).json({
          success: false,
          message: 'Monitor not found',
        });
      }

      await monitorRepository.delete(id);

      res.json({
        success: true,
        message: 'Monitor deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async checks(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 100;

      const monitor = await monitorRepository.findById(id);

      if (!monitor) {
        return res.status(404).json({
          success: false,
          message: 'Monitor not found',
        });
      }

      const checks = await monitorRepository.getChecks(id, limit);

      res.json({
        success: true,
        data: { checks },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async runCheck(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const monitor = await monitorRepository.findById(id);

      if (!monitor) {
        return res.status(404).json({
          success: false,
          message: 'Monitor not found',
        });
      }

      const result = await monitoringService.checkMonitor(monitor);

      res.json({
        success: true,
        data: { result },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
