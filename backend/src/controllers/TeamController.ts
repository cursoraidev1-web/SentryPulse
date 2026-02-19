import { Request, Response } from 'express';
import { getPool } from '../config/database';
import { uuid } from '../utils/helpers';
import slugify from 'slugify';

export class TeamController {
  
  // GET /api/teams (List all teams for the current user)
  async index(req: Request, res: Response) {
    try {
      const pool = getPool();
      // 🛠️ FIX: Use (req as any) to access .user
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get teams where user is owner OR a member
      const [teams]: any = await pool.query(`
        SELECT t.*, tu.role 
        FROM teams t
        JOIN team_users tu ON t.id = tu.team_id
        WHERE tu.user_id = ?
        ORDER BY t.created_at DESC
      `, [userId]);

      res.json({
        success: true,
        data: teams
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/teams (Create a new team)
  async store(req: Request, res: Response) {
    try {
      const pool = getPool();
      const { name } = req.body;
      // 🛠️ FIX
      const userId = (req as any).user?.id;

      if (!name) {
        return res.status(400).json({ message: 'Team name is required' });
      }

      // Generate a unique slug
      let slug = slugify(name, { lower: true, strict: true });
      const teamUuid = uuid();

      // Check if slug exists and append random number if it does
      const [existing]: any = await pool.query('SELECT id FROM teams WHERE slug = ?', [slug]);
      if (existing.length > 0) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }

      // 1. Create the Team
      const [result]: any = await pool.query(
        'INSERT INTO teams (uuid, name, slug, owner_id) VALUES (?, ?, ?, ?)',
        [teamUuid, name, slug, userId]
      );
      
      const teamId = result.insertId;

      // 2. Add the Creator as the Owner in team_users
      await pool.query(
        'INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)',
        [teamId, userId, 'owner']
      );

      // Fetch the created team to return it
      const [newTeam]: any = await pool.query('SELECT * FROM teams WHERE id = ?', [teamId]);

      res.status(201).json({
        success: true,
        data: newTeam[0]
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/teams/:id (Get single team details)
  async show(req: Request, res: Response) {
    try {
      const pool = getPool();
      const teamId = req.params.id;
      // 🛠️ FIX
      const userId = (req as any).user?.id;

      // Verify membership
      const [membership]: any = await pool.query(
        'SELECT role FROM team_users WHERE team_id = ? AND user_id = ?',
        [teamId, userId]
      );

      if (membership.length === 0) {
        return res.status(403).json({ message: 'You are not a member of this team' });
      }

      const [team]: any = await pool.query('SELECT * FROM teams WHERE id = ?', [teamId]);

      if (team.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
      }

      res.json({
        success: true,
        data: { ...team[0], role: membership[0].role }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // PUT /api/teams/:id (Update team)
  async update(req: Request, res: Response) {
    try {
      const pool = getPool();
      const teamId = req.params.id;
      const { name, settings, plan, plan_expires_at } = req.body;
      const userId = (req as any).user?.id;

      // Verify owner or admin role
      const [membership]: any = await pool.query(
        'SELECT role FROM team_users WHERE team_id = ? AND user_id = ?',
        [teamId, userId]
      );

      if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Update fields
      if (name) {
        await pool.query('UPDATE teams SET name = ? WHERE id = ?', [name, teamId]);
      }
      if (settings !== undefined) {
        const settingsString = typeof settings === 'object' ? JSON.stringify(settings) : settings;
        await pool.query('UPDATE teams SET settings = ? WHERE id = ?', [settingsString, teamId]);
      }
      // Billing: allow changing plan (free, pro, business)
      if (plan !== undefined) {
        const allowed = ['free', 'pro', 'business'];
        const planValue = String(plan).toLowerCase();
        if (!allowed.includes(planValue)) {
          return res.status(400).json({ message: 'Invalid plan. Use: free, pro, or business' });
        }
        if (plan_expires_at !== undefined) {
          await pool.query('UPDATE teams SET plan = ?, plan_expires_at = ? WHERE id = ?', [planValue, plan_expires_at || null, teamId]);
        } else {
          await pool.query('UPDATE teams SET plan = ? WHERE id = ?', [planValue, teamId]);
        }
      }

      res.json({ success: true, message: 'Team updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/teams/:id (Delete team)
  async destroy(req: Request, res: Response) {
    try {
      const pool = getPool();
      const teamId = req.params.id;
      // 🛠️ FIX
      const userId = (req as any).user?.id;

      // Only owner can delete
      const [team]: any = await pool.query('SELECT owner_id FROM teams WHERE id = ?', [teamId]);
      
      if (team.length === 0) return res.status(404).json({ message: 'Team not found' });
      
      if (team[0].owner_id !== userId) {
        return res.status(403).json({ message: 'Only the team owner can delete the team' });
      }

      await pool.query('DELETE FROM teams WHERE id = ?', [teamId]);

      res.json({ success: true, message: 'Team deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/teams/:id/members (Add member)
  async addMember(req: Request, res: Response) {
    try {
      const pool = getPool();
      const teamId = req.params.id;
      const { email, role = 'member' } = req.body;
      // 🛠️ FIX
      const userId = (req as any).user?.id;

      // Check permissions
      const [requester]: any = await pool.query(
        'SELECT role FROM team_users WHERE team_id = ? AND user_id = ?',
        [teamId, userId]
      );

      if (requester.length === 0 || !['owner', 'admin'].includes(requester[0].role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Find user by email
      const [userToAdd]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      
      if (userToAdd.length === 0) {
        return res.status(404).json({ message: 'User not found with that email' });
      }

      // Add to team
      await pool.query(
        'INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)',
        [teamId, userToAdd[0].id, role]
      );

      res.json({ success: true, message: 'Member added successfully' });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'User is already in the team' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/teams/:id/members/:userId (Remove member)
  async removeMember(req: Request, res: Response) {
    try {
      const pool = getPool();
      const teamId = req.params.id;
      const userIdToRemove = req.params.userId;
      const requesterId = (req as any).user?.id;

      const [requester]: any = await pool.query(
        'SELECT role FROM team_users WHERE team_id = ? AND user_id = ?',
        [teamId, requesterId]
      );

      if (requester.length === 0 || !['owner', 'admin'].includes(requester[0].role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const [owner]: any = await pool.query('SELECT owner_id FROM teams WHERE id = ?', [teamId]);
      if (owner.length > 0 && owner[0].owner_id === Number(userIdToRemove)) {
        return res.status(400).json({ message: 'Cannot remove the team owner' });
      }

      const [result]: any = await pool.query(
        'DELETE FROM team_users WHERE team_id = ? AND user_id = ?',
        [teamId, userIdToRemove]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Member not found in this team' });
      }

      res.json({ success: true, message: 'Member removed successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
