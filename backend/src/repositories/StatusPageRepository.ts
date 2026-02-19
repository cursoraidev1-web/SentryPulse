import { query, queryOne, insert, execute } from '../config/database';

export class StatusPageRepository {
  async findByTeam(teamId: number) {
    return query<any>(
      'SELECT * FROM status_pages WHERE team_id = ? ORDER BY created_at DESC',
      [teamId]
    );
  }

  async findById(id: number) {
    return queryOne<any>('SELECT * FROM status_pages WHERE id = ?', [id]);
  }

  async findBySlug(slug: string) {
    return queryOne<any>(
      'SELECT * FROM status_pages WHERE slug = ? AND is_public = TRUE',
      [slug]
    );
  }

  async create(data: { team_id: number; name: string; slug: string; domain?: string; is_public?: boolean }) {
    const id = await insert(
      `INSERT INTO status_pages (team_id, name, slug, domain, is_public) VALUES (?, ?, ?, ?, ?)`,
      [data.team_id, data.name, data.slug, data.domain || null, data.is_public !== false ? 1 : 0]
    );
    return this.findById(id);
  }

  async update(id: number, data: { name?: string; slug?: string; domain?: string; is_public?: boolean }) {
    const updates: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
    if (data.slug !== undefined) { updates.push('slug = ?'); values.push(data.slug); }
    if (data.domain !== undefined) { updates.push('domain = ?'); values.push(data.domain); }
    if (data.is_public !== undefined) { updates.push('is_public = ?'); values.push(data.is_public ? 1 : 0); }
    if (updates.length === 0) return;
    values.push(id);
    await execute(`UPDATE status_pages SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  async delete(id: number) {
    await execute('DELETE FROM status_pages WHERE id = ?', [id]);
  }

  async getMonitors(statusPageId: number) {
    return query<any>(
      `SELECT spm.*, m.name as monitor_name, m.status as monitor_status, m.last_checked_at, m.last_response_time
       FROM status_page_monitors spm
       JOIN monitors m ON m.id = spm.monitor_id
       WHERE spm.status_page_id = ?
       ORDER BY spm.display_order ASC, spm.id ASC`,
      [statusPageId]
    );
  }

  async addMonitor(statusPageId: number, monitorId: number, displayOrder = 0) {
    await insert(
      `INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order) VALUES (?, ?, ?)`,
      [statusPageId, monitorId, displayOrder]
    );
  }

  async removeMonitor(statusPageId: number, monitorId: number) {
    await execute(
      'DELETE FROM status_page_monitors WHERE status_page_id = ? AND monitor_id = ?',
      [statusPageId, monitorId]
    );
  }
}
