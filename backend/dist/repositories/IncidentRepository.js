"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentRepository = void 0;
const database_1 = require("../config/database");
class IncidentRepository {
    async findByTeam(teamId) {
        // Note: We join on sentry_monitors now
        return (0, database_1.query)(`SELECT i.*, m.name as monitor_name 
       FROM sentry_incidents i 
       LEFT JOIN sentry_monitors m ON i.monitor_id = m.id 
       WHERE i.team_id = ? 
       ORDER BY i.created_at DESC`, [teamId]);
    }
    async findById(id) {
        return (0, database_1.queryOne)(`SELECT i.*, m.name as monitor_name 
       FROM sentry_incidents i 
       LEFT JOIN sentry_monitors m ON i.monitor_id = m.id 
       WHERE i.id = ?`, [id]);
    }
    async create(data) {
        return (0, database_1.query)(`INSERT INTO sentry_incidents (team_id, monitor_id, title, description, status) 
       VALUES (?, ?, ?, ?, ?)`, [data.team_id, data.monitor_id || null, data.title, data.description, data.status || 'investigating']);
    }
    async update(id, data) {
        const updates = [];
        const values = [];
        if (data.title !== undefined) {
            updates.push('title = ?');
            values.push(data.title);
        }
        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description);
        }
        if (data.status !== undefined) {
            updates.push('status = ?');
            values.push(data.status);
        }
        if (updates.length === 0)
            return;
        values.push(id);
        await (0, database_1.execute)(`UPDATE sentry_incidents SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    async resolve(id) {
        await (0, database_1.execute)(`UPDATE sentry_incidents SET status = 'resolved', resolved_at = NOW(),
       duration_seconds = TIMESTAMPDIFF(SECOND, COALESCE(started_at, created_at), NOW()) WHERE id = ?`, [id]);
    }
}
exports.IncidentRepository = IncidentRepository;
//# sourceMappingURL=IncidentRepository.js.map