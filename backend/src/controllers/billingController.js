import { db } from '../core/database.js';
import { now } from '../core/helpers.js';

// Plan limits configuration
const PLAN_LIMITS = {
  free: {
    monitors: 5,
    status_pages: 1,
    pageviews_per_month: 10000,
  },
  pro: {
    monitors: 50,
    status_pages: Infinity,
    pageviews_per_month: 100000,
  },
  business: {
    monitors: Infinity,
    status_pages: Infinity,
    pageviews_per_month: Infinity,
  },
};

export const updatePlan = async (req, res, next) => {
  try {
    const { team_id, plan } = req.body;

    if (!team_id || !plan) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: {
          team_id: team_id ? undefined : 'Team ID is required',
          plan: plan ? undefined : 'Plan is required',
        },
      });
    }

    // Validate plan
    const validPlans = ['free', 'pro', 'business'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan. Must be one of: ${validPlans.join(', ')}`,
      });
    }

    // Check if team exists and user has access
    const team = await db.queryOne(
      'SELECT * FROM teams WHERE id = ?',
      [parseInt(team_id)]
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Update team plan
    const planExpiresAt = plan === 'free' 
      ? null 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await db.execute(
      'UPDATE teams SET plan = ?, plan_expires_at = ?, updated_at = ? WHERE id = ?',
      [plan, planExpiresAt, now(), parseInt(team_id)]
    );

    // Create or update subscription record
    const existingSubscription = await db.queryOne(
      'SELECT * FROM subscriptions WHERE team_id = ?',
      [parseInt(team_id)]
    );

    if (existingSubscription) {
      await db.execute(
        `UPDATE subscriptions 
         SET plan = ?, status = ?, expires_at = ?, updated_at = ?
         WHERE team_id = ?`,
        [plan, 'active', planExpiresAt, now(), parseInt(team_id)]
      );
    } else {
      await db.insert(
        `INSERT INTO subscriptions (team_id, plan, status, started_at, expires_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          parseInt(team_id),
          plan,
          'active',
          now(),
          planExpiresAt,
          now(),
          now(),
        ]
      );
    }

    const updatedTeam = await db.queryOne(
      'SELECT * FROM teams WHERE id = ?',
      [parseInt(team_id)]
    );

    res.json({
      success: true,
      data: {
        team: updatedTeam,
      },
      message: `Plan updated to ${plan}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsage = async (req, res, next) => {
  try {
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { team_id: 'Team ID is required' },
      });
    }

    // Get team plan
    const team = await db.queryOne(
      'SELECT plan FROM teams WHERE id = ?',
      [parseInt(team_id)]
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    const plan = team.plan || 'free';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    // Get current usage
    const monitorCount = await db.queryOne(
      'SELECT COUNT(*)::int as count FROM monitors WHERE team_id = ?',
      [parseInt(team_id)]
    );

    const statusPageCount = await db.queryOne(
      'SELECT COUNT(*)::int as count FROM status_pages WHERE team_id = ?',
      [parseInt(team_id)]
    );

    // Get pageviews for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const pageviewCount = await db.queryOne(
      `SELECT COUNT(*)::int as count 
       FROM pageviews_raw pv
       JOIN sites s ON s.id = pv.site_id
       WHERE s.team_id = ?
       AND TO_CHAR(pv.viewed_at, 'YYYY-MM') = ?`,
      [parseInt(team_id), currentMonth]
    );

    const usage = {
      monitors: monitorCount?.count || 0,
      status_pages: statusPageCount?.count || 0,
      pageviews: pageviewCount?.count || 0,
      limits: {
        monitors: limits.monitors === Infinity ? null : limits.monitors,
        status_pages: limits.status_pages === Infinity ? null : limits.status_pages,
        pageviews_per_month: limits.pageviews_per_month === Infinity ? null : limits.pageviews_per_month,
      },
      plan: plan,
    };

    res.json({
      success: true,
      data: {
        usage,
      },
    });
  } catch (error) {
    next(error);
  }
};

