import { db } from '../core/database.js';
import { now } from '../core/helpers.js';

export class UsageTrackingService {
  async recordUsage(teamId, metricType, value = 1) {
    const today = new Date().toISOString().slice(0, 10);
    const monthStart = new Date().toISOString().slice(0, 7) + '-01';
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    // Record daily usage
    await db.execute(
      `INSERT INTO usage_records (team_id, metric_type, metric_value, period_start, period_end, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [teamId, `${metricType}_daily`, value, today, today, now()]
    );

    // Record monthly usage (aggregate)
    const monthlyTotal = await db.queryOne(
      `SELECT COALESCE(SUM(metric_value), 0)::int as total
       FROM usage_records
       WHERE team_id = ?
       AND metric_type = ?
       AND period_start >= ?
       AND period_end <= ?`,
      [teamId, `${metricType}_daily`, monthStart, monthEnd]
    );

    await db.execute(
      `INSERT INTO usage_records (team_id, metric_type, metric_value, period_start, period_end, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
      [
        teamId,
        `${metricType}_monthly`,
        monthlyTotal?.total || value,
        monthStart,
        monthEnd,
        now(),
      ]
    );
  }

  async getUsage(teamId, metricType, period = 'month') {
    const today = new Date();
    let periodStart, periodEnd;

    if (period === 'month') {
      periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    } else if (period === 'day') {
      periodStart = today.toISOString().slice(0, 10);
      periodEnd = periodStart;
    }

    const result = await db.queryOne(
      `SELECT COALESCE(SUM(metric_value), 0)::int as total
       FROM usage_records
       WHERE team_id = ?
       AND metric_type = ?
       AND period_start >= ?
       AND period_end <= ?`,
      [teamId, `${metricType}_${period}`, periodStart, periodEnd]
    );

    return result?.total || 0;
  }

  async checkLimit(teamId, metricType, limit) {
    if (limit === null || limit === Infinity) {
      return { allowed: true, used: 0, limit: null };
    }

    const used = await this.getUsage(teamId, metricType, 'month');
    const allowed = used < limit;

    return {
      allowed,
      used,
      limit,
      remaining: limit - used,
    };
  }
}

