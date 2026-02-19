import { query, queryOne, execute } from '../config/database';

export class IncidentRepository {
  async findByTeam(teamId: number) {
    // Note: We join on monitors now
    return query(
      `SELECT i.*, m.name as monitor_name 
       FROM incidents i 
       LEFT JOIN monitors m ON i.monitor_id = m.id 
       WHERE i.team_id = ? 
       ORDER BY i.created_at DESC`,
      [teamId]
    );
  }

  async findById(id: number) {
    return queryOne<any>(
      `SELECT i.*, m.name as monitor_name 
       FROM incidents i 
       LEFT JOIN monitors m ON i.monitor_id = m.id 
       WHERE i.id = ?`,
      [id]
    );
  }

  async create(data: any) {
    return query(
      `INSERT INTO incidents (team_id, monitor_id, title, description, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.team_id, data.monitor_id || null, data.title, data.description, data.status || 'investigating']
    );
  }

  async update(id: number, data: { title?: string; description?: string; status?: string }) {
    const updates: string[] = [];
    const values: any[] = [];
    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
    if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
    if (updates.length === 0) return;
    values.push(id);
    await execute(
      `UPDATE incidents SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  async resolve(id: number) {
    await execute(
      `UPDATE incidents SET status = 'resolved', resolved_at = NOW(),
       duration_seconds = TIMESTAMPDIFF(SECOND, COALESCE(started_at, created_at), NOW()) WHERE id = ?`,
      [id]
    );
  }
}
