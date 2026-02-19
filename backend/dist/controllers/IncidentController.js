"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentController = void 0;
const IncidentRepository_1 = require("../repositories/IncidentRepository");
class IncidentController {
    repo = new IncidentRepository_1.IncidentRepository();
    // GET /api/incidents?team_id=1
    index = async (req, res) => {
        try {
            const teamId = Number(req.query.team_id);
            if (!teamId)
                return res.status(400).json({ message: 'Team ID required' });
            const incidents = await this.repo.findByTeam(teamId);
            res.json({ success: true, data: { incidents } });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // GET /api/incidents/:id
    show = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const incident = await this.repo.findById(id);
            if (!incident)
                return res.status(404).json({ message: 'Incident not found' });
            res.json({ success: true, data: incident });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // POST /api/incidents
    store = async (req, res) => {
        try {
            const { team_id, title, description, monitor_id, status } = req.body;
            await this.repo.create({ team_id, title, description, monitor_id, status });
            res.status(201).json({ success: true, message: 'Incident created' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // PUT /api/incidents/:id
    update = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const incident = await this.repo.findById(id);
            if (!incident)
                return res.status(404).json({ message: 'Incident not found' });
            const { title, description, status } = req.body;
            await this.repo.update(id, { title, description, status });
            res.json({ success: true, message: 'Incident updated' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // POST /api/incidents/:id/resolve
    resolve = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const incident = await this.repo.findById(id);
            if (!incident)
                return res.status(404).json({ message: 'Incident not found' });
            await this.repo.resolve(id);
            res.json({ success: true, message: 'Incident resolved' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}
exports.IncidentController = IncidentController;
//# sourceMappingURL=IncidentController.js.map