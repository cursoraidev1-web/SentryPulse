"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusPageRepository = void 0;
const database_1 = require("../config/database");
class StatusPageRepository {
    async findByTeam(teamId) {
        return (0, database_1.query)('SELECT * FROM status_pages WHERE team_id = ? ORDER BY created_at DESC', [teamId]);
    }
    async findById(id) {
        return (0, database_1.queryOne)('SELECT * FROM status_pages WHERE id = ?', [id]);
    }
    async findBySlug(slug) {
        return (0, database_1.queryOne)('SELECT * FROM status_pages WHERE slug = ? AND is_public = TRUE', [slug]);
    }
    async create(data) {
        const id = await (0, database_1.insert)(`INSERT INTO status_pages (team_id, name, slug, domain, is_public) VALUES (?, ?, ?, ?, ?)`, [data.team_id, data.name, data.slug, data.domain || null, data.is_public !== false ? 1 : 0]);
        return this.findById(id);
    }
    async update(id, data) {
        const updates = [];
        const values = [];
        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.slug !== undefined) {
            updates.push('slug = ?');
            values.push(data.slug);
        }
        if (data.domain !== undefined) {
            updates.push('domain = ?');
            values.push(data.domain);
        }
        if (data.is_public !== undefined) {
            updates.push('is_public = ?');
            values.push(data.is_public ? 1 : 0);
        }
        if (updates.length === 0)
            return;
        values.push(id);
        await (0, database_1.execute)(`UPDATE status_pages SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    async delete(id) {
        await (0, database_1.execute)('DELETE FROM status_pages WHERE id = ?', [id]);
    }
    async getMonitors(statusPageId) {
        return (0, database_1.query)(`SELECT spm.*, m.name as monitor_name, m.status as monitor_status, m.last_checked_at, m.last_response_time
       FROM status_page_monitors spm
       JOIN monitors m ON m.id = spm.monitor_id
       WHERE spm.status_page_id = ?
       ORDER BY spm.display_order ASC, spm.id ASC`, [statusPageId]);
    }
    async addMonitor(statusPageId, monitorId, displayOrder = 0) {
        await (0, database_1.insert)(`INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order) VALUES (?, ?, ?)`, [statusPageId, monitorId, displayOrder]);
    }
    async removeMonitor(statusPageId, monitorId) {
        await (0, database_1.execute)('DELETE FROM status_page_monitors WHERE status_page_id = ? AND monitor_id = ?', [statusPageId, monitorId]);
    }
}
exports.StatusPageRepository = StatusPageRepository;
//# sourceMappingURL=StatusPageRepository.js.map