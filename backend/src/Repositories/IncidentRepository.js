import { db } from '../core/database.js';
import { Incident } from '../models/Incident.js';
import { now } from '../core/helpers.js';

export class IncidentRepository {
  async findById(id) {
    const data = await db.queryOne('SELECT * FROM incidents WHERE id = ?', [id]);
    return data ? Incident.fromArray(data) : null;
  }

  async findByMonitor(monitorId, limit = 50) {
    const data = await db.query(
      `SELECT * FROM incidents 
       WHERE monitor_id = ? 
       ORDER BY started_at DESC 
       LIMIT ?`,
      [monitorId, limit]
    );

    return data.map(item => Incident.fromArray(item));
  }

  async findActiveByMonitor(monitorId) {
    const data = await db.queryOne(
      `SELECT * FROM incidents 
       WHERE monitor_id = ? 
       AND status != 'resolved' 
       ORDER BY started_at DESC 
       LIMIT 1`,
      [monitorId]
    );

    return data ? Incident.fromArray(data) : null;
  }

  async findByTeam(teamId, status = null, limit = 100) {
    let sql = `SELECT i.* FROM incidents i
               INNER JOIN monitors m ON i.monitor_id = m.id
               WHERE m.team_id = ?`;
    const params = [teamId];

    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY i.started_at DESC LIMIT ?';
    params.push(limit);

    const data = await db.query(sql, params);
    return data.map(item => Incident.fromArray(item));
  }

  async create(attributes) {
    const id = await db.insert(
      `INSERT INTO incidents (
        monitor_id, title, description, status, severity,
        started_at, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attributes.monitor_id,
        attributes.title,
        attributes.description || null,
        attributes.status || 'investigating',
        attributes.severity || 'major',
        attributes.started_at || now(),
        attributes.metadata ? JSON.stringify(attributes.metadata) : null,
        now(),
        now()
      ]
    );

    return await this.findById(id);
  }

  async update(id, attributes) {
    const allowedFields = ['title', 'description', 'status', 'severity'];
    const fields = [];
    const params = [];

    for (const key of allowedFields) {
      if (key in attributes) {
        fields.push(`${key} = ?`);
        params.push(attributes[key]);
      }
    }

    if ('metadata' in attributes) {
      fields.push('metadata = ?');
      params.push(JSON.stringify(attributes.metadata));
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = ?');
    params.push(now());
    params.push(id);

    const sql = `UPDATE incidents SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);
    return true;
  }

  async resolve(id) {
    const incident = await this.findById(id);
    if (!incident) {
      return false;
    }

    const startedAt = new Date(incident.started_at).getTime();
    const resolvedAt = Date.now();
    const duration = Math.floor((resolvedAt - startedAt) / 1000);

    await db.execute(
      `UPDATE incidents SET 
        status = 'resolved',
        resolved_at = ?,
        duration_seconds = ?,
        updated_at = ?
       WHERE id = ?`,
      [now(), duration, now(), id]
    );
    return true;
  }

  async delete(id) {
    await db.execute('DELETE FROM incidents WHERE id = ?', [id]);
    return true;
  }
}





