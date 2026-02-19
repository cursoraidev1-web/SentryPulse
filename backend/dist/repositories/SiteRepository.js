"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteRepository = void 0;
const database_1 = require("../config/database");
const helpers_1 = require("../utils/helpers");
const uuid_1 = require("uuid");
class SiteRepository {
    // Find a single site by ID
    async findById(id) {
        return (0, database_1.queryOne)('SELECT * FROM sites WHERE id = ?', [id]);
    }
    // Find all sites for a specific team
    async findByTeam(teamId) {
        return (0, database_1.query)('SELECT * FROM sites WHERE team_id = ? ORDER BY created_at DESC', [teamId]);
    }
    // Create a new website to track
    async create(data) {
        // Generate a unique tracking code (e.g., SP-A1B2C3D4)
        const trackingCode = `SP-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`;
        const id = await (0, database_1.insert)(`INSERT INTO sites 
      (team_id, name, domain, tracking_code, is_enabled, timezone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.team_id,
            data.name,
            data.domain,
            trackingCode,
            true, // is_enabled defaults to true
            data.timezone || 'UTC',
            (0, helpers_1.now)(),
            (0, helpers_1.now)()
        ]);
        return this.findById(id);
    }
    // Update a site
    async update(id, data) {
        const updates = [];
        const values = [];
        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.domain !== undefined) {
            updates.push('domain = ?');
            values.push(data.domain);
        }
        if (data.timezone !== undefined) {
            updates.push('timezone = ?');
            values.push(data.timezone);
        }
        if (data.is_enabled !== undefined) {
            updates.push('is_enabled = ?');
            values.push(data.is_enabled);
        }
        if (updates.length === 0)
            return;
        updates.push('updated_at = ?');
        values.push((0, helpers_1.now)(), id);
        await (0, database_1.execute)(`UPDATE sites SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    // Delete a site
    async delete(id) {
        await (0, database_1.execute)('DELETE FROM sites WHERE id = ?', [id]);
    }
}
exports.SiteRepository = SiteRepository;
//# sourceMappingURL=SiteRepository.js.map