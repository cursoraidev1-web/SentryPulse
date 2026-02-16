"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("../config/database");
const helpers_1 = require("../utils/helpers");
class UserRepository {
    async findById(id) {
        return (0, database_1.queryOne)('SELECT * FROM users WHERE id = ?', [id]);
    }
    async findByEmail(email) {
        return (0, database_1.queryOne)('SELECT * FROM users WHERE email = ?', [email]);
    }
    async create(data) {
        const id = await (0, database_1.insert)('INSERT INTO users (name, email, password, timezone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [data.name, data.email, data.password, data.timezone || 'UTC', (0, helpers_1.now)(), (0, helpers_1.now)()]);
        return this.findById(id);
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        if (data.name) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.email) {
            fields.push('email = ?');
            values.push(data.email);
        }
        if (data.avatar !== undefined) {
            fields.push('avatar = ?');
            values.push(data.avatar);
        }
        if (data.timezone) {
            fields.push('timezone = ?');
            values.push(data.timezone);
        }
        if (fields.length === 0)
            return;
        fields.push('updated_at = ?');
        values.push((0, helpers_1.now)(), id);
        await (0, database_1.execute)(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    async updateLastLogin(id) {
        await (0, database_1.execute)('UPDATE users SET last_login_at = ? WHERE id = ?', [(0, helpers_1.now)(), id]);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map