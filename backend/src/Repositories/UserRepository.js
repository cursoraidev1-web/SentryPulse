import { db } from '../core/database.js';
import { User } from '../models/User.js';
import { now } from '../core/helpers.js';

export class UserRepository {
  async findById(id) {
    const data = await db.queryOne('SELECT * FROM users WHERE id = ?', [id]);
    return data ? User.fromArray(data) : null;
  }

  async findByEmail(email) {
    const data = await db.queryOne('SELECT * FROM users WHERE email = ?', [email]);
    return data ? User.fromArray(data) : null;
  }

  async create(attributes) {
    const id = await db.insert(
      `INSERT INTO users (name, email, password, timezone, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        attributes.name,
        attributes.email,
        attributes.password,
        attributes.timezone || 'UTC',
        now(),
        now()
      ]
    );

    return await this.findById(id);
  }

  async update(id, attributes) {
    const allowedFields = ['name', 'email', 'avatar', 'timezone'];
    const fields = [];
    const params = [];

    for (const key of allowedFields) {
      if (key in attributes) {
        fields.push(`${key} = ?`);
        params.push(attributes[key]);
      }
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = ?');
    params.push(now());
    params.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);
    return true;
  }

  async updateLastLogin(id) {
    await db.execute(
      'UPDATE users SET last_login_at = ? WHERE id = ?',
      [now(), id]
    );
    return true;
  }

  async delete(id) {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
}





