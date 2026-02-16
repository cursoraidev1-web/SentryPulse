"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorRepository = void 0;
const database_1 = require("../config/database");
const helpers_1 = require("../utils/helpers");
class MonitorRepository {
    async findById(id) {
        return (0, database_1.queryOne)('SELECT * FROM monitors WHERE id = ?', [id]);
    }
    async findByTeam(teamId) {
        return (0, database_1.query)('SELECT * FROM monitors WHERE team_id = ? ORDER BY created_at DESC', [teamId]);
    }
    async findEnabled() {
        return (0, database_1.query)('SELECT * FROM monitors WHERE is_enabled = TRUE ORDER BY last_checked_at ASC');
    }
    async create(data) {
        const id = await (0, database_1.insert)(`INSERT INTO monitors (
        team_id, name, url, type, method, \`interval\`, timeout,
        is_enabled, check_ssl, check_keyword, expected_status_code,
        headers, body, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
            (0, helpers_1.now)(),
            (0, helpers_1.now)(),
        ]);
        return this.findById(id);
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        const allowedFields = ['name', 'url', 'type', 'method', 'interval', 'timeout', 'is_enabled', 'check_ssl', 'check_keyword', 'expected_status_code', 'body'];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }
        if (data.headers !== undefined) {
            fields.push('headers = ?');
            values.push(JSON.stringify(data.headers));
        }
        if (fields.length === 0)
            return;
        fields.push('updated_at = ?');
        values.push((0, helpers_1.now)(), id);
        await (0, database_1.execute)(`UPDATE monitors SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    async updateCheckResult(id, data) {
        await (0, database_1.execute)('UPDATE monitors SET last_checked_at = ?, last_status = ?, last_response_time = ?, status = ? WHERE id = ?', [(0, helpers_1.now)(), data.status, data.response_time || null, data.monitor_status, id]);
    }
    async createCheck(monitorId, data) {
        return (0, database_1.insert)(`INSERT INTO monitor_checks (
        monitor_id, status, status_code, response_time,
        error_message, ssl_valid, ssl_expires_at,
        dns_resolved, keyword_found, checked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            monitorId,
            data.status,
            data.status_code || null,
            data.response_time || null,
            data.error_message || null,
            data.ssl_valid || null,
            data.ssl_expires_at || null,
            data.dns_resolved || null,
            data.keyword_found || null,
            (0, helpers_1.now)(),
        ]);
    }
    async getChecks(monitorId, limit = 100) {
        return (0, database_1.query)('SELECT * FROM monitor_checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT ?', [monitorId, limit]);
    }
    async delete(id) {
        await (0, database_1.execute)('DELETE FROM monitors WHERE id = ?', [id]);
    }
}
exports.MonitorRepository = MonitorRepository;
//# sourceMappingURL=MonitorRepository.js.map