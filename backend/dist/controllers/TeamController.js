"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const database_1 = require("../config/database");
const helpers_1 = require("../utils/helpers");
const slugify_1 = __importDefault(require("slugify"));
class TeamController {
    // GET /api/teams (List all teams for the current user)
    async index(req, res) {
        try {
            const pool = (0, database_1.getPool)();
            // 🛠️ FIX: Use (req as any) to access .user
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // Get teams where user is owner OR a member
            const [teams] = await pool.query(`
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
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // POST /api/teams (Create a new team)
    async store(req, res) {
        try {
            const pool = (0, database_1.getPool)();
            const { name } = req.body;
            // 🛠️ FIX
            const userId = req.user?.id;
            if (!name) {
                return res.status(400).json({ message: 'Team name is required' });
            }
            // Generate a unique slug
            let slug = (0, slugify_1.default)(name, { lower: true, strict: true });
            const teamUuid = (0, helpers_1.uuid)();
            // Check if slug exists and append random number if it does
            const [existing] = await pool.query('SELECT id FROM teams WHERE slug = ?', [slug]);
            if (existing.length > 0) {
                slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
            }
            // 1. Create the Team
            const [result] = await pool.query('INSERT INTO teams (uuid, name, slug, owner_id) VALUES (?, ?, ?, ?)', [teamUuid, name, slug, userId]);
            const teamId = result.insertId;
            // 2. Add the Creator as the Owner in team_users
            await pool.query('INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)', [teamId, userId, 'owner']);
            // Fetch the created team to return it
            const [newTeam] = await pool.query('SELECT * FROM teams WHERE id = ?', [teamId]);
            res.status(201).json({
                success: true,
                data: newTeam[0]
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // GET /api/teams/:id (Get single team details)
    async show(req, res) {
        try {
            const pool = (0, database_1.getPool)();
            const teamId = req.params.id;
            // 🛠️ FIX
            const userId = req.user?.id;
            // Verify membership
            const [membership] = await pool.query('SELECT role FROM team_users WHERE team_id = ? AND user_id = ?', [teamId, userId]);
            if (membership.length === 0) {
                return res.status(403).json({ message: 'You are not a member of this team' });
            }
            const [team] = await pool.query('SELECT * FROM teams WHERE id = ?', [teamId]);
            if (team.length === 0) {
                return res.status(404).json({ message: 'Team not found' });
            }
            res.json({
                success: true,
                data: { ...team[0], role: membership[0].role }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // PUT /api/teams/:id (Update team)
    async update(req, res) {
        try {
            const pool = (0, database_1.getPool)();
            const teamId = req.params.id;
            const { name, settings } = req.body;
            // 🛠️ FIX
            const userId = req.user?.id;
            // Verify owner or admin role
            const [membership] = await pool.query('SELECT role FROM team_users WHERE team_id = ? AND user_id = ?', [teamId, userId]);
            if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }
            // Update fields
            if (name) {
                await pool.query('UPDATE teams SET name = ? WHERE id = ?', [name, teamId]);
            }
            if (settings) {
                // Ensure settings is stored as a string since we used TEXT type in DB
                const settingsString = typeof settings === 'object' ? JSON.stringify(settings) : settings;
                await pool.query('UPDATE teams SET settings = ? WHERE id = ?', [settingsString, teamId]);
            }
            res.json({ success: true, message: 'Team updated successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // DELETE /api/teams/:id (Delete team)
    async destroy(req, res) {
        try {
            const pool = (0, database_1.getPool)();
            const teamId = req.params.id;
            // 🛠️ FIX
            const userId = req.user?.id;
            // Only owner can delete
            const [team] = await pool.query('SELECT owner_id FROM teams WHERE id = ?', [teamId]);
            if (team.length === 0)
                return res.status(404).json({ message: 'Team not found' });
            if (team[0].owner_id !== userId) {
                return res.status(403).json({ message: 'Only the team owner can delete the team' });
            }
            await pool.query('DELETE FROM teams WHERE id = ?', [teamId]);
            res.json({ success: true, message: 'Team deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // POST /api/teams/:id/members (Add member)
    async addMember(req, res) {
        try {
            const pool = (0, database_1.getPool)();
            const teamId = req.params.id;
            const { email, role = 'member' } = req.body;
            // 🛠️ FIX
            const userId = req.user?.id;
            // Check permissions
            const [requester] = await pool.query('SELECT role FROM team_users WHERE team_id = ? AND user_id = ?', [teamId, userId]);
            if (requester.length === 0 || !['owner', 'admin'].includes(requester[0].role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }
            // Find user by email
            const [userToAdd] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
            if (userToAdd.length === 0) {
                return res.status(404).json({ message: 'User not found with that email' });
            }
            // Add to team
            await pool.query('INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)', [teamId, userToAdd[0].id, role]);
            res.json({ success: true, message: 'Member added successfully' });
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'User is already in the team' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // DELETE /api/teams/:id/members/:userId (Remove member)
    async removeMember(req, res) {
        try {
            const pool = (0, database_1.getPool)();
            const teamId = req.params.id;
            const userIdToRemove = req.params.userId;
            const requesterId = req.user?.id;
            const [requester] = await pool.query('SELECT role FROM team_users WHERE team_id = ? AND user_id = ?', [teamId, requesterId]);
            if (requester.length === 0 || !['owner', 'admin'].includes(requester[0].role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }
            const [owner] = await pool.query('SELECT owner_id FROM teams WHERE id = ?', [teamId]);
            if (owner.length > 0 && owner[0].owner_id === Number(userIdToRemove)) {
                return res.status(400).json({ message: 'Cannot remove the team owner' });
            }
            const [result] = await pool.query('DELETE FROM team_users WHERE team_id = ? AND user_id = ?', [teamId, userIdToRemove]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Member not found in this team' });
            }
            res.json({ success: true, message: 'Member removed successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.TeamController = TeamController;
//# sourceMappingURL=TeamController.js.map