"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorController = void 0;
const MonitorRepository_1 = require("../repositories/MonitorRepository");
const MonitoringService_1 = require("../services/MonitoringService");
const monitorRepository = new MonitorRepository_1.MonitorRepository();
const monitoringService = new MonitoringService_1.MonitoringService();
class MonitorController {
    async index(req, res) {
        try {
            const teamId = parseInt(req.query.team_id);
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async show(req, res) {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async store(req, res) {
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    async update(req, res) {
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    async destroy(req, res) {
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    async checks(req, res) {
        try {
            const id = parseInt(req.params.id);
            const limit = parseInt(req.query.limit) || 100;
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async runCheck(req, res) {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.MonitorController = MonitorController;
//# sourceMappingURL=MonitorController.js.map