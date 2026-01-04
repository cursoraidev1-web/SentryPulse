import { TeamRepository } from '../repositories/TeamRepository.js';
import { AuthService } from '../services/AuthService.js';

const teamRepository = new TeamRepository();

const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const index = async (req, res, next) => {
  try {
    const teams = await teamRepository.findByUser(req.user.id);

    res.json({
      success: true,
      data: {
        teams: teams.map(t => t.toArray())
      }
    });
  } catch (error) {
    next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const team = await teamRepository.findById(parseInt(req.params.id));

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get team members
    const members = await teamRepository.getTeamMembers(parseInt(req.params.id));
    const teamData = team.toArray();
    teamData.members = members;

    res.json({
      success: true,
      data: { team: teamData }
    });
  } catch (error) {
    next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { name: 'Team name is required' }
      });
    }

    let slug = generateSlug(name);
    const existing = await teamRepository.findBySlug(slug);
    if (existing) {
      slug += '-' + Date.now().toString().slice(-5);
    }

    const team = await teamRepository.create({
      name,
      slug,
      owner_id: req.user.id,
      plan: req.body.plan || 'free'
    });

    res.status(201).json({
      success: true,
      data: { team: team.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const team = await teamRepository.findById(parseInt(req.params.id));

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await teamRepository.update(parseInt(req.params.id), req.body);
    const updatedTeam = await teamRepository.findById(parseInt(req.params.id));

    res.json({
      success: true,
      data: { team: updatedTeam.toArray() }
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { user_id: 'User ID is required' }
      });
    }

    const team = await teamRepository.findById(parseInt(req.params.id));

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await teamRepository.addMember(
      parseInt(req.params.id),
      parseInt(user_id),
      req.body.role || 'member',
      req.body.invited_by || null
    );

    res.json({
      success: true,
      message: 'Member added successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const team = await teamRepository.findById(parseInt(req.params.id));

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await teamRepository.removeMember(
      parseInt(req.params.id),
      parseInt(req.params.userId)
    );

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};



