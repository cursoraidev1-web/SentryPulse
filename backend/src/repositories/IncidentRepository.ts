import { query } from '../config/database';

export class IncidentRepository {
  async findByTeam(teamId: number) {
    // Note: We join on sentry_monitors now
    return query(
      `SELECT i.*, m.name as monitor_name 
       FROM sentry_incidents i 
       LEFT JOIN sentry_monitors m ON i.monitor_id = m.id 
       WHERE i.team_id = ? 
       ORDER BY i.created_at DESC`,
      [teamId]
    );
  }

  async create(data: any) {
    return query(
      `INSERT INTO sentry_incidents (team_id, monitor_id, title, description, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.team_id, data.monitor_id || null, data.title, data.description, data.status || 'investigating']
    );
  }
}
