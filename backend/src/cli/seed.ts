import { insert, queryOne } from '../config/database';
import { hashPassword, uuid, now } from '../utils/helpers';
import crypto from 'crypto';

async function seed() {
  console.log('Seeding database...\n');

  // Create user (idempotent: use existing if present)
  let userId: number;
  const existingUser = await queryOne<{ id: number }>('SELECT id FROM users WHERE email = ?', ['admin@sentrypulse.com']);
  if (existingUser) {
    userId = existingUser.id;
    console.log('✓ Demo user already exists (admin@sentrypulse.com / password)');
  } else {
    const hashedPassword = await hashPassword('password');
    userId = await insert(
      'INSERT INTO users (name, email, password, email_verified_at, created_at) VALUES (?, ?, ?, ?, ?)',
      ['Admin User', 'admin@sentrypulse.com', hashedPassword, now(), now()]
    );
    console.log('✓ Created demo user (admin@sentrypulse.com / password)');
  }

  // Create team (idempotent: use existing team for this owner if present)
  let teamId: number;
  const existingTeam = await queryOne<{ id: number }>('SELECT id FROM teams WHERE owner_id = ? LIMIT 1', [userId]);
  if (existingTeam) {
    teamId = existingTeam.id;
    console.log('✓ Demo team already exists');
  } else {
    const teamUuid = uuid();
    teamId = await insert(
      'INSERT INTO teams (uuid, name, slug, owner_id, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [teamUuid, 'SentryPulse Team', 'sentrypulse-team', userId, 'pro', now()]
    );
    console.log('✓ Created demo team');

    await insert(
      'INSERT INTO team_users (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)',
      [teamId, userId, 'owner', now()]
    );

    const trackingCode = 'SP_' + crypto.randomBytes(6).toString('hex').toUpperCase();
    const siteId = await insert(
      'INSERT INTO sites (team_id, name, domain, tracking_code, is_enabled, public_stats, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [teamId, 'Demo Site', 'demo.sentrypulse.com', trackingCode, true, true, now()]
    );
    console.log('✓ Created demo site for analytics');

    const monitorId = await insert(
      'INSERT INTO monitors (team_id, name, url, type, method, `interval`, is_enabled, check_ssl, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [teamId, 'Main Website', 'https://example.com', 'https', 'GET', 60, true, true, now()]
    );
    console.log('✓ Created demo monitor');

    await insert(
      'INSERT INTO notification_channels (team_id, name, type, is_enabled, config, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [teamId, 'Default Email', 'email', true, JSON.stringify({ email: 'admin@sentrypulse.com' }), now()]
    );
    console.log('✓ Created notification channel');

    const statusPageId = await insert(
      'INSERT INTO status_pages (team_id, name, slug, is_public, created_at) VALUES (?, ?, ?, ?, ?)',
      [teamId, 'Public Status', 'public-status', true, now()]
    );
    console.log('✓ Created status page');

    await insert(
      'INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order) VALUES (?, ?, ?)',
      [statusPageId, monitorId, 1]
    );
  }

  console.log('\nDatabase seeded successfully!');
}

async function main() {
  try {
    await seed();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
