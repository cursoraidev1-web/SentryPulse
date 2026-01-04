import crypto from 'crypto';
import { db } from '../core/database.js';
import { SiteRepository } from '../repositories/SiteRepository.js';
import { now } from '../core/helpers.js';

export class AnalyticsService {
  constructor() {
    this.siteRepository = new SiteRepository();
  }

  async recordPageview(trackingCode, data) {
    const site = await this.siteRepository.findByTrackingCode(trackingCode);

    if (!site || !site.is_enabled) {
      return false;
    }

    const visitorId = this.hashVisitorId(data.ip, data.user_agent);
    const sessionId = data.session_id || this.generateSessionId(visitorId);

    await this.siteRepository.recordPageview(site.id, {
      visitor_id: visitorId,
      session_id: sessionId,
      url: data.url,
      referrer: data.referrer || null,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      browser: data.browser || null,
      os: data.os || null,
      device_type: data.device_type || null,
      country_code: data.country_code || null,
      screen_width: data.screen_width || null,
      screen_height: data.screen_height || null,
      viewed_at: now()
    });

    return true;
  }

  async recordEvent(trackingCode, data) {
    const site = await this.siteRepository.findByTrackingCode(trackingCode);

    if (!site || !site.is_enabled) {
      return false;
    }

    const visitorId = this.hashVisitorId(data.ip, data.user_agent);
    const sessionId = data.session_id || this.generateSessionId(visitorId);

    await this.siteRepository.recordEvent(site.id, {
      visitor_id: visitorId,
      session_id: sessionId,
      event_name: data.event_name,
      properties: data.properties || null,
      url: data.url || null,
      occurred_at: now()
    });

    return true;
  }

  async aggregateDailyStats(date) {
    const sites = await db.query('SELECT id FROM sites WHERE is_enabled = TRUE');

    for (const site of sites) {
      await this.aggregateSiteStats(site.id, date);
    }
  }

  async aggregateSiteStats(siteId, date) {
    const stats = await db.queryOne(
      `SELECT 
        COUNT(*)::int as pageviews,
        COUNT(DISTINCT visitor_id)::int as unique_visitors,
        COUNT(DISTINCT session_id)::int as sessions
       FROM pageviews_raw
       WHERE site_id = ? 
       AND DATE(viewed_at) = ?::date`,
      [siteId, date]
    );

    await db.execute(
      `INSERT INTO pageviews_daily 
        (site_id, date, pageviews, unique_visitors, sessions)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (site_id, date) DO UPDATE
        SET pageviews = EXCLUDED.pageviews,
            unique_visitors = EXCLUDED.unique_visitors,
            sessions = EXCLUDED.sessions`,
      [
        siteId,
        date,
        stats.pageviews,
        stats.unique_visitors,
        stats.sessions
      ]
    );

    const events = await db.query(
      `SELECT 
        event_name,
        COUNT(*)::int as count,
        COUNT(DISTINCT visitor_id)::int as unique_users
       FROM events_raw
       WHERE site_id = ? 
       AND DATE(occurred_at) = ?::date
       GROUP BY event_name`,
      [siteId, date]
    );

    for (const event of events) {
      await db.execute(
        `INSERT INTO events_daily 
          (site_id, event_name, date, count, unique_users)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (site_id, event_name, date) DO UPDATE
          SET count = EXCLUDED.count,
              unique_users = EXCLUDED.unique_users`,
        [
          siteId,
          event.event_name,
          date,
          event.count,
          event.unique_users
        ]
      );
    }
  }

  async getPageviewStats(siteId, startDate, endDate) {
    return await db.query(
      `SELECT * FROM pageviews_daily 
       WHERE site_id = ? 
       AND date BETWEEN ? AND ?
       ORDER BY date ASC`,
      [siteId, startDate, endDate]
    );
  }

  async getEventStats(siteId, eventName, startDate, endDate) {
    return await db.query(
      `SELECT * FROM events_daily 
       WHERE site_id = ? 
       AND event_name = ?
       AND date BETWEEN ? AND ?
       ORDER BY date ASC`,
      [siteId, eventName, startDate, endDate]
    );
  }

  async getTopPages(siteId, startDate, endDate, limit = 10) {
    return await db.query(
      `SELECT 
        url,
        COUNT(*)::int as views,
        COUNT(DISTINCT visitor_id)::int as unique_visitors
       FROM pageviews_raw
       WHERE site_id = ?
       AND DATE(viewed_at) BETWEEN ?::date AND ?::date
       GROUP BY url
       ORDER BY views DESC
       LIMIT ?`,
      [siteId, startDate, endDate, limit]
    );
  }

  async getTopReferrers(siteId, startDate, endDate, limit = 10) {
    return await db.query(
      `SELECT 
        referrer,
        COUNT(*)::int as visits
       FROM pageviews_raw
       WHERE site_id = ?
       AND DATE(viewed_at) BETWEEN ?::date AND ?::date
       AND referrer IS NOT NULL
       AND referrer != ''
       GROUP BY referrer
       ORDER BY visits DESC
       LIMIT ?`,
      [siteId, startDate, endDate, limit]
    );
  }

  hashVisitorId(ip, userAgent) {
    const today = new Date().toISOString().slice(0, 10);
    return crypto.createHash('sha256').update(ip + userAgent + today).digest('hex');
  }

  generateSessionId(visitorId) {
    return crypto.createHash('sha256').update(visitorId + Date.now()).digest('hex');
  }
}


