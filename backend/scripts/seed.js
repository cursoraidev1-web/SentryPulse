import { db } from '../src/core/database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { now } from '../src/core/helpers.js';

dotenv.config();

async function seed() {
  try {
    console.log('Starting database seed...');

    // Check if admin user already exists
    const existingAdmin = await db.queryOne(
      'SELECT * FROM users WHERE email = ?',
      ['admin@sentrypulse.com']
    );

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('password', 10);
    const adminId = await db.insert(
      `INSERT INTO users (name, email, password, email_verified_at, timezone, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Admin User',
        'admin@sentrypulse.com',
        hashedPassword,
        now(),
        'UTC',
        now(),
        now()
      ]
    );

    console.log(`✓ Created admin user (ID: ${adminId})`);

    // Create default team for admin
    const teamId = await db.insert(
      `INSERT INTO teams (uuid, name, slug, owner_id, plan, created_at, updated_at) 
       VALUES (gen_random_uuid()::text, ?, ?, ?, ?, ?, ?)`,
      [
        'My Team',
        'my-team',
        adminId,
        'free',
        now(),
        now()
      ]
    );

    console.log(`✓ Created default team (ID: ${teamId})`);

    // Add admin to team
    await db.insert(
      `INSERT INTO team_users (team_id, user_id, role, joined_at, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        teamId,
        adminId,
        'owner',
        now(),
        now(),
        now()
      ]
    );

    console.log(`✓ Added admin to team`);

    // Create sample monitor
    const monitorId = await db.insert(
      `INSERT INTO monitors (team_id, name, url, type, method, interval, timeout, status, is_enabled, check_ssl, expected_status_code, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        teamId,
        'Example Monitor',
        'https://example.com',
        'https',
        'GET',
        60,
        30,
        'unknown',
        true,
        true,
        200,
        now(),
        now()
      ]
    );

    console.log(`✓ Created sample monitor (ID: ${monitorId})`);

    // Create sample analytics site
    const trackingCode = 'SP_' + Math.random().toString(36).substring(2, 15).toUpperCase();
    const siteId = await db.insert(
      `INSERT INTO sites (team_id, name, domain, tracking_code, is_enabled, timezone, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        teamId,
        'Example Site',
        'example.com',
        trackingCode,
        true,
        'UTC',
        now(),
        now()
      ]
    );

    console.log(`✓ Created sample analytics site (ID: ${siteId}, Code: ${trackingCode})`);

    // Create sample status page
    const statusPageId = await db.insert(
      `INSERT INTO status_pages (team_id, name, slug, is_public, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        teamId,
        'Example Status Page',
        'example-status',
        true,
        now(),
        now()
      ]
    );

    console.log(`✓ Created sample status page (ID: ${statusPageId})`);

    // Add monitor to status page
    await db.insert(
      `INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order) 
       VALUES (?, ?, ?)`,
      [statusPageId, monitorId, 0]
    );

    console.log(`✓ Added monitor to status page`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDefault credentials:');
    console.log('  Email: admin@sentrypulse.com');
    console.log('  Password: password');
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('✗ Seed error:', error);
    throw error;
  } finally {
    await db.close();
  }
}

seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});


