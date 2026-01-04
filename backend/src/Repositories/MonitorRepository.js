import { db } from '../core/database.js';
import { Monitor } from '../models/Monitor.js';
import { now } from '../core/helpers.js';

export class MonitorRepository {
  async findById(id) {
    const data = await db.queryOne('SELECT * FROM monitors WHERE id = ?', [id]);
    return data ? Monitor.fromArray(data) : null;
  }

  async findByTeam(teamId) {
    const data = await db.query(
      'SELECT * FROM monitors WHERE team_id = ? ORDER BY created_at DESC',
      [teamId]
    );

    return data.map(item => Monitor.fromArray(item));
  }

  async findEnabled() {
    const data = await db.query(
      'SELECT * FROM monitors WHERE is_enabled = TRUE ORDER BY last_checked_at ASC, last_checked_at IS NULL'
    );

    return data.map(item => Monitor.fromArray(item));
  }

  async create(attributes) {
    const id = await db.insert(
      `INSERT INTO monitors (
        team_id, name, url, type, method, interval, timeout,
        is_enabled, check_ssl, check_keyword, expected_status_code,
        headers, body, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attributes.team_id,
        attributes.name,
        attributes.url,
        attributes.type || 'https',
        attributes.method || 'GET',
        attributes.interval || 60,
        attributes.timeout || 30,
        attributes.is_enabled !== undefined ? attributes.is_enabled : true,
        attributes.check_ssl !== undefined ? attributes.check_ssl : true,
        attributes.check_keyword || null,
        attributes.expected_status_code || 200,
        attributes.headers ? JSON.stringify(attributes.headers) : null,
        attributes.body || null,
        now(),
        now()
      ]
    );

    return await this.findById(id);
  }

  async update(id, attributes) {
    const allowedFields = [
      'name', 'url', 'type', 'method', 'interval', 'timeout',
      'is_enabled', 'check_ssl', 'check_keyword', 'expected_status_code', 'body'
    ];

    const fields = [];
    const params = [];

    for (const key of allowedFields) {
      if (key in attributes) {
        fields.push(`${key} = ?`);
        params.push(attributes[key]);
      }
    }

    if ('headers' in attributes) {
      fields.push('headers = ?');
      params.push(JSON.stringify(attributes.headers));
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = ?');
    params.push(now());
    params.push(id);

    const sql = `UPDATE monitors SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);
    return true;
  }

  async updateCheckResult(id, data) {
    await db.execute(
      `UPDATE monitors SET 
        last_checked_at = ?,
        last_status = ?,
        last_response_time = ?,
        status = ?
       WHERE id = ?`,
      [
        now(),
        data.status,
        data.response_time || null,
        data.monitor_status,
        id
      ]
    );
    return true;
  }

  async updateUptimePercentage(id) {
    const result = await db.queryOne(
      `SELECT 
        COUNT(*)::int as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)::int as successes
       FROM monitor_checks 
       WHERE monitor_id = ? 
       AND checked_at >= NOW() - INTERVAL '30 days'`,
      [id]
    );

    if (result && result.total > 0) {
      const percentage = (result.successes / result.total) * 100;
      await db.execute(
        'UPDATE monitors SET uptime_percentage = ? WHERE id = ?',
        [Math.round(percentage * 100) / 100, id]
      );
    }

    return true;
  }

  async delete(id) {
    await db.execute('DELETE FROM monitors WHERE id = ?', [id]);
    return true;
  }

  async getChecks(monitorId, limit = 100) {
    return await db.query(
      `SELECT * FROM monitor_checks 
       WHERE monitor_id = ? 
       ORDER BY checked_at DESC 
       LIMIT ?`,
      [monitorId, limit]
    );
  }

  async createCheck(monitorId, data) {
    const id = await db.insert(
      `INSERT INTO monitor_checks (
        monitor_id, status, status_code, response_time,
        error_message, ssl_valid, ssl_expires_at,
        dns_resolved, keyword_found, checked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        monitorId,
        data.status,
        data.status_code || null,
        data.response_time || null,
        data.error_message || null,
        data.ssl_valid || null,
        data.ssl_expires_at || null,
        data.dns_resolved || null,
        data.keyword_found || null,
        now()
      ]
    );

    return id;
  }
}

