import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export function uuid() {
  return uuidv4();
}

export async function bcryptHash(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function bcryptVerify(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function env(key, defaultValue = null) {
  const value = process.env[key];
  
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || lowerValue === '(true)') {
    return true;
  }
  if (lowerValue === 'false' || lowerValue === '(false)') {
    return false;
  }
  if (lowerValue === 'empty' || lowerValue === '(empty)') {
    return '';
  }
  if (lowerValue === 'null' || lowerValue === '(null)') {
    return null;
  }

  return value;
}

export function config(key, defaultValue = null) {
  const configs = {
    app: {
      name: env('APP_NAME', 'SentryPulse'),
      url: env('APP_URL', 'http://localhost:8000'),
      env: env('NODE_ENV', 'development'),
      debug: env('APP_DEBUG', 'false') === 'true'
    },
    jwt: {
      secret: env('JWT_SECRET', 'your-secret-key-change-this-in-production'),
      algo: 'HS256',
      ttl: parseInt(env('JWT_TTL', '1440')) // 24 hours in minutes
    },
    database: {
      redis: {
        default: {
          host: env('REDIS_HOST', 'localhost'),
          port: parseInt(env('REDIS_PORT', '6379')),
          password: env('REDIS_PASSWORD', null)
        }
      }
    }
  };

  const keys = key.split('.');
  let value = configs;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }

  return value !== undefined ? value : defaultValue;
}





