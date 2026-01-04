import { db } from '../core/database.js';
import { Site } from '../models/Site.js';
import { now } from '../core/helpers.js';
import crypto from 'crypto';

export class SiteRepository {
  async findById(id) {
    const data = await db.queryOne('SELECT * FROM sites WHERE id = ?', [id]);
    return data ? Site.fromArray(data) : null;
  }

  async findByTrackingCode(trackingCode) {
    const data = await db.queryOne(
      'SELECT * FROM sites WHERE tracking_code = ?',
      [trackingCode]
    );
    return data ? Site.fromArray(data) : null;
  }

  async findByTeam(teamId) {
    const data = await db.query(
      'SELECT * FROM sites WHERE team_id = ? ORDER BY created_at DESC',
      [teamId]
    );

    return data.map(item => Site.fromArray(item));
  }

  async create(attributes) {
    const trackingCode = 'SP_' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const id = await db.insert(
      `INSERT INTO sites (
        team_id, name, domain, tracking_code, is_enabled,
        timezone, public_stats, settings, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attributes.team_id,
        attributes.name,
        attributes.domain,
        trackingCode,
        attributes.is_enabled !== undefined ? attributes.is_enabled : true,
        attributes.timezone || 'UTC',
        attributes.public_stats !== undefined ? attributes.public_stats : false,
        attributes.settings ? JSON.stringify(attributes.settings) : null,
        now(),
        now()
      ]
    );

    return await this.findById(id);
  }

  async update(id, attributes) {
    const allowedFields = ['name', 'domain', 'is_enabled', 'timezone', 'public_stats'];
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

    const sql = `UPDATE sites SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);
    return true;
  }

  async delete(id) {
    await db.execute('DELETE FROM sites WHERE id = ?', [id]);
    return true;
  }

  async recordPageview(siteId, data) {
    const id = await db.insert(
      `INSERT INTO pageviews_raw (
        site_id, visitor_id, session_id, url, referrer,
        utm_source, utm_medium, utm_campaign,
        browser, os, device_type, country_code,
        screen_width, screen_height, viewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        siteId,
        data.visitor_id,
        data.session_id,
        data.url,
        data.referrer || null,
        data.utm_source || null,
        data.utm_medium || null,
        data.utm_campaign || null,
        data.browser || null,
        data.os || null,
        data.device_type || null,
        data.country_code || null,
        data.screen_width || null,
        data.screen_height || null,
        data.viewed_at || now()
      ]
    );

    return id;
  }

  async recordEvent(siteId, data) {
    const id = await db.insert(
      `INSERT INTO events_raw (
        site_id, visitor_id, session_id, event_name,
        properties, url, occurred_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        siteId,
        data.visitor_id,
        data.session_id,
        data.event_name,
        data.properties ? JSON.stringify(data.properties) : null,
        data.url || null,
        data.occurred_at || now()
      ]
    );

    return id;
  }
}





