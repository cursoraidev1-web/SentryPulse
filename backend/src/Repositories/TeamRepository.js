import { db } from '../core/database.js';
import { Team } from '../models/Team.js';
import { now, uuid } from '../core/helpers.js';

export class TeamRepository {
  async findById(id) {
    const data = await db.queryOne('SELECT * FROM teams WHERE id = ?', [id]);
    return data ? Team.fromArray(data) : null;
  }

  async findByUuid(uuidValue) {
    const data = await db.queryOne('SELECT * FROM teams WHERE uuid = ?', [uuidValue]);
    return data ? Team.fromArray(data) : null;
  }

  async findBySlug(slug) {
    const data = await db.queryOne('SELECT * FROM teams WHERE slug = ?', [slug]);
    return data ? Team.fromArray(data) : null;
  }

  async findByUser(userId) {
    const data = await db.query(
      `SELECT t.* FROM teams t
       INNER JOIN team_users tu ON t.id = tu.team_id
       WHERE tu.user_id = ?
       ORDER BY t.created_at DESC`,
      [userId]
    );

    return data.map(item => Team.fromArray(item));
  }

  async create(attributes) {
    const uuidValue = uuid();
    const id = await db.insert(
      `INSERT INTO teams (uuid, name, slug, owner_id, plan, settings, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidValue,
        attributes.name,
        attributes.slug,
        attributes.owner_id,
        attributes.plan || 'free',
        attributes.settings ? JSON.stringify(attributes.settings) : null,
        now(),
        now()
      ]
    );

    await db.execute(
      'INSERT INTO team_users (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)',
      [id, attributes.owner_id, 'owner', now()]
    );

    return await this.findById(id);
  }

  async update(id, attributes) {
    const allowedFields = ['name', 'slug', 'plan', 'plan_expires_at'];
    const fields = [];
    const params = [];

    for (const key of allowedFields) {
      if (key in attributes) {
        fields.push(`${key} = ?`);
        params.push(attributes[key]);
      }
    }

    if ('settings' in attributes) {
      fields.push('settings = ?');
      params.push(JSON.stringify(attributes.settings));
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = ?');
    params.push(now());
    params.push(id);

    const sql = `UPDATE teams SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);
    return true;
  }

  async addMember(teamId, userId, role = 'member', invitedBy = null) {
    await db.execute(
      'INSERT INTO team_users (team_id, user_id, role, invited_by, joined_at) VALUES (?, ?, ?, ?, ?)',
      [teamId, userId, role, invitedBy, now()]
    );
    return true;
  }

  async removeMember(teamId, userId) {
    await db.execute(
      'DELETE FROM team_users WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );
    return true;
  }

  async updateMemberRole(teamId, userId, role) {
    await db.execute(
      'UPDATE team_users SET role = ? WHERE team_id = ? AND user_id = ?',
      [role, teamId, userId]
    );
    return true;
  }

  async isMember(teamId, userId) {
    const result = await db.queryOne(
      'SELECT id FROM team_users WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );

    return result !== null;
  }

  async getMemberRole(teamId, userId) {
    const result = await db.queryOne(
      'SELECT role FROM team_users WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );

    return result ? result.role : null;
  }

  async delete(id) {
    await db.execute('DELETE FROM teams WHERE id = ?', [id]);
    return true;
  }

  async getTeamMembers(teamId) {
    const members = await db.query(
      `SELECT 
        tu.id,
        tu.team_id,
        tu.user_id,
        tu.role,
        tu.invited_by,
        tu.joined_at,
        tu.created_at,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
       FROM team_users tu
       INNER JOIN users u ON tu.user_id = u.id
       WHERE tu.team_id = ?
       ORDER BY tu.joined_at ASC`,
      [teamId]
    );

    return members.map(member => ({
      id: member.id,
      user_id: member.user_id,
      role: member.role,
      invited_by: member.invited_by,
      joined_at: member.joined_at,
      created_at: member.created_at,
      user: {
        id: member.user_id,
        name: member.user_name,
        email: member.user_email,
        avatar: member.user_avatar
      }
    }));
  }
}



