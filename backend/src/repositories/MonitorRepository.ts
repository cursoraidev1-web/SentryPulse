import { query, queryOne, insert, execute } from '../config/database';
import { Monitor } from '../models/types';
import { now } from '../utils/helpers';

export class MonitorRepository {
  async findById(id: number): Promise<Monitor | null> {
    return queryOne<Monitor>('SELECT * FROM monitors WHERE id = ?', [id]);
  }

  async findByTeam(teamId: number): Promise<Monitor[]> {
    return query<Monitor>('SELECT * FROM monitors WHERE team_id = ? ORDER BY created_at DESC', [teamId]);
  }

  async findEnabled(): Promise<Monitor[]> {
    return query<Monitor>('SELECT * FROM monitors WHERE is_enabled = TRUE ORDER BY last_checked_at ASC');
  }

  async create(data: Partial<Monitor>): Promise<Monitor> {
    const id = await insert(
      `INSERT INTO monitors (
        team_id, name, url, type, method, \`interval\`, timeout,
        is_enabled, check_ssl, check_keyword, expected_status_code,
        headers, body, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.team_id,
        data.name,
        data.url,
        data.type || 'https',
        data.method || 'GET',
        data.interval || 60,
        data.timeout || 30,
        data.is_enabled !== false,
        data.check_ssl !== false,
        data.check_keyword || null,
        data.expected_status_code || 200,
        data.headers ? JSON.stringify(data.headers) : null,
        data.body || null,
        now(),
        now(),
      ]
    );
    return this.findById(id) as Promise<Monitor>;
  }

  async update(id: number, data: Partial<Monitor>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = ['name', 'url', 'type', 'method', 'interval', 'timeout', 'is_enabled', 'check_ssl', 'check_keyword', 'expected_status_code', 'body'];

    for (const field of allowedFields) {
      if (data[field as keyof Monitor] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field as keyof Monitor]);
      }
    }

    if (data.headers !== undefined) {
      fields.push('headers = ?');
      values.push(JSON.stringify(data.headers));
    }

    if (fields.length === 0) return;

    fields.push('updated_at = ?');
    values.push(now(), id);

    await execute(`UPDATE monitors SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async updateCheckResult(id: number, data: any): Promise<void> {
    await execute(
      'UPDATE monitors SET last_checked_at = ?, last_status = ?, last_response_time = ?, status = ? WHERE id = ?',
      [now(), data.status, data.response_time || null, data.monitor_status, id]
    );
  }

  async createCheck(monitorId: number, data: any): Promise<number> {
    return insert(
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
        now(),
      ]
    );
  }

  async getChecks(monitorId: number, limit: number = 100): Promise<any[]> {
    return query(
      'SELECT * FROM monitor_checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT ?',
      [monitorId, limit]
    );
  }

  async delete(id: number): Promise<void> {
    await execute('DELETE FROM monitors WHERE id = ?', [id]);
  }
}
