import { db } from '../core/database.js';
import { now } from '../core/helpers.js';

export const index = async (req, res, next) => {
  try {
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { team_id: 'Team ID is required' }
      });
    }

    const channels = await db.query(
      'SELECT * FROM notification_channels WHERE team_id = ? ORDER BY created_at DESC',
      [parseInt(team_id)]
    );

    res.json({
      success: true,
      data: {
        channels: channels.map(channel => ({
          ...channel,
          config: typeof channel.config === 'string' ? JSON.parse(channel.config) : channel.config
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const channel = await db.queryOne(
      'SELECT * FROM notification_channels WHERE id = ?',
      [parseInt(req.params.id)]
    );

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Notification channel not found'
      });
    }

    res.json({
      success: true,
      data: {
        channel: {
          ...channel,
          config: typeof channel.config === 'string' ? JSON.parse(channel.config) : channel.config
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { team_id, type, name, config, is_enabled } = req.body;

    // Validation
    if (!team_id || !type || !name || !config) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: {
          team_id: team_id ? undefined : 'Team ID is required',
          type: type ? undefined : 'Type is required',
          name: name ? undefined : 'Name is required',
          config: config ? undefined : 'Config is required'
        }
      });
    }

    // Validate type
    const validTypes = ['email', 'telegram', 'whatsapp', 'webhook', 'slack'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate config based on type
    const configObj = typeof config === 'string' ? JSON.parse(config) : config;
    
    if (type === 'email' && !configObj.email && !configObj.to) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required for email channel'
      });
    }

    if (type === 'telegram' && !configObj.chat_id) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required for Telegram channel'
      });
    }

    if (type === 'webhook' && !configObj.url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required for webhook channel'
      });
    }

    if (type === 'whatsapp' && !configObj.phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for WhatsApp channel'
      });
    }

    const id = await db.insert(
      `INSERT INTO notification_channels (team_id, type, name, config, is_enabled, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(team_id),
        type,
        name,
        JSON.stringify(configObj),
        is_enabled !== undefined ? is_enabled : true,
        now(),
        now()
      ]
    );

    const channel = await db.queryOne(
      'SELECT * FROM notification_channels WHERE id = ?',
      [id]
    );

    res.status(201).json({
      success: true,
      data: {
        channel: {
          ...channel,
          config: configObj
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { name, config, is_enabled } = req.body;
    const channelId = parseInt(req.params.id);

    // Check if channel exists
    const existing = await db.queryOne(
      'SELECT * FROM notification_channels WHERE id = ?',
      [channelId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Notification channel not found'
      });
    }

    const fields = [];
    const params = [];

    if (name !== undefined) {
      fields.push('name = ?');
      params.push(name);
    }

    if (config !== undefined) {
      const configObj = typeof config === 'string' ? JSON.parse(config) : config;
      fields.push('config = ?');
      params.push(JSON.stringify(configObj));
    }

    if (is_enabled !== undefined) {
      fields.push('is_enabled = ?');
      params.push(is_enabled);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    fields.push('updated_at = ?');
    params.push(now());
    params.push(channelId);

    const sql = `UPDATE notification_channels SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);

    const updated = await db.queryOne(
      'SELECT * FROM notification_channels WHERE id = ?',
      [channelId]
    );

    res.json({
      success: true,
      data: {
        channel: {
          ...updated,
          config: typeof updated.config === 'string' ? JSON.parse(updated.config) : updated.config
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const channelId = parseInt(req.params.id);

    const channel = await db.queryOne(
      'SELECT * FROM notification_channels WHERE id = ?',
      [channelId]
    );

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Notification channel not found'
      });
    }

    await db.execute('DELETE FROM notification_channels WHERE id = ?', [channelId]);

    res.json({
      success: true,
      message: 'Notification channel deleted'
    });
  } catch (error) {
    next(error);
  }
};


