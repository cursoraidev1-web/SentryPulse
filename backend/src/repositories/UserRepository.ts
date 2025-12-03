import { query, queryOne, insert, execute } from '../config/database';
import { User } from '../models/types';
import { now } from '../utils/helpers';

export class UserRepository {
  async findById(id: number): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
  }

  async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE email = ?', [email]);
  }

  async create(data: Partial<User>): Promise<User> {
    const id = await insert(
      'INSERT INTO users (name, email, password, timezone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.email, data.password, data.timezone || 'UTC', now(), now()]
    );
    return this.findById(id) as Promise<User>;
  }

  async update(id: number, data: Partial<User>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

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

    if (fields.length === 0) return;

    fields.push('updated_at = ?');
    values.push(now(), id);

    await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async updateLastLogin(id: number): Promise<void> {
    await execute('UPDATE users SET last_login_at = ? WHERE id = ?', [now(), id]);
  }
}
