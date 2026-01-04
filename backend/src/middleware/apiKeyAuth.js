import crypto from 'crypto';
import { db } from '../core/database.js';
import { now } from '../core/helpers.js';

export const apiKeyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'API key required. Use format: Authorization: Bearer <api_key>',
      });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Find API key
    const apiKeyRecord = await db.queryOne(
      'SELECT * FROM api_keys WHERE key_hash = ?',
      [keyHash]
    );

    if (!apiKeyRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
      });
    }

    // Update last used timestamp
    await db.execute(
      'UPDATE api_keys SET last_used_at = ? WHERE id = ?',
      [now(), apiKeyRecord.id]
    );

    // Get team info
    const team = await db.queryOne(
      'SELECT * FROM teams WHERE id = ?',
      [apiKeyRecord.team_id]
    );

    if (!team) {
      return res.status(401).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Attach team to request
    req.team = team;
    req.apiKey = apiKeyRecord;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

