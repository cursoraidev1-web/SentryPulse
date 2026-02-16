import { Request, Response } from 'express';
import { IncidentRepository } from '../repositories/IncidentRepository';

export class IncidentController { // <--- The "export" keyword is crucial
  private repo = new IncidentRepository();

  // GET /api/incidents?team_id=1
  index = async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.query.team_id);
      if (!teamId) return res.status(400).json({ message: 'Team ID required' });

      const incidents = await this.repo.findByTeam(teamId);
      res.json({ success: true, data: { incidents } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // POST /api/incidents
  store = async (req: Request, res: Response) => {
    try {
      const { team_id, title, description, monitor_id, status } = req.body;
      
      await this.repo.create({ team_id, title, description, monitor_id, status });
      
      res.status(201).json({ success: true, message: 'Incident created' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}
