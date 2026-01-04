import { IncidentService } from '../services/IncidentService.js';

const incidentService = new IncidentService();

export const index = async (req, res, next) => {
  try {
    const { team_id, status, limit = 100 } = req.query;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { team_id: 'Team ID is required' }
      });
    }

    const incidents = await incidentService.getTeamIncidents(
      parseInt(team_id),
      status || null,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        incidents: incidents.map(i => i.toArray())
      }
    });
  } catch (error) {
    next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const incident = await incidentService.getIncident(parseInt(req.params.id));

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    res.json({
      success: true,
      data: { incident: incident.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const incident = await incidentService.getIncident(parseInt(req.params.id));

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    const updatedIncident = await incidentService.updateIncident(
      parseInt(req.params.id),
      req.body
    );

    res.json({
      success: true,
      data: { incident: updatedIncident.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const resolve = async (req, res, next) => {
  try {
    const incident = await incidentService.getIncident(parseInt(req.params.id));

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    const resolvedIncident = await incidentService.resolveIncident(parseInt(req.params.id));

    res.json({
      success: true,
      data: { incident: resolvedIncident.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const monitorIncidents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || 50);
    const incidents = await incidentService.getMonitorIncidents(
      parseInt(req.params.monitorId),
      limit
    );

    res.json({
      success: true,
      data: {
        incidents: incidents.map(i => i.toArray())
      }
    });
  } catch (error) {
    next(error);
  }
};





