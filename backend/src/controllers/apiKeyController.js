import { db } from '../core/database.js';
import crypto from 'crypto';
import { now } from '../core/helpers.js';

export const index = async (req, res, next) => {
  try {
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { team_id: 'Team ID is required' },
      });
    }

    const apiKeys = await db.query(
      'SELECT id, name, key_prefix, last_used_at, created_at FROM api_keys WHERE team_id = ? ORDER BY created_at DESC',
      [parseInt(team_id)]
    );

    // Mask the keys for security (only show prefix)
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      key: key.key_prefix ? `${key.key_prefix}****` : '****',
    }));

    res.json({
      success: true,
      data: {
        api_keys: maskedKeys,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { team_id, name } = req.body;

    if (!team_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: {
          team_id: team_id ? undefined : 'Team ID is required',
          name: name ? undefined : 'Name is required',
        },
      });
    }

    // Generate API key
    const keyPrefix = 'sp_' + crypto.randomBytes(8).toString('hex');
    const keySecret = crypto.randomBytes(32).toString('hex');
    const fullKey = `${keyPrefix}_${keySecret}`;
    const hashedKey = crypto.createHash('sha256').update(fullKey).digest('hex');

    const id = await db.insert(
      `INSERT INTO api_keys (team_id, name, key_hash, key_prefix, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        parseInt(team_id),
        name,
        hashedKey,
        keyPrefix,
        now(),
        now(),
      ]
    );

    // Return the full key only once (for security)
    res.status(201).json({
      success: true,
      data: {
        api_key: {
          id,
          name,
          key: fullKey, // Only returned on creation
          key_prefix: keyPrefix,
          created_at: now(),
        },
      },
      message: 'API key created. Save this key - it will not be shown again.',
    });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const keyId = parseInt(req.params.id);

    const apiKey = await db.queryOne(
      'SELECT * FROM api_keys WHERE id = ?',
      [keyId]
    );

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
      });
    }

    await db.execute('DELETE FROM api_keys WHERE id = ?', [keyId]);

    res.json({
      success: true,
      message: 'API key deleted',
    });
  } catch (error) {
    next(error);
  }
};

