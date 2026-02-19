"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const helpers_1 = require("../utils/helpers");
const crypto_1 = __importDefault(require("crypto"));
async function seed() {
    console.log('Seeding database...\n');
    // Create user
    const hashedPassword = await (0, helpers_1.hashPassword)('password');
    const userId = await (0, database_1.insert)('INSERT INTO users (name, email, password, email_verified_at, created_at) VALUES (?, ?, ?, ?, ?)', ['Admin User', 'admin@sentrypulse.com', hashedPassword, (0, helpers_1.now)(), (0, helpers_1.now)()]);
    console.log('✓ Created demo user (admin@sentrypulse.com / password)');
    // Create team
    const teamUuid = (0, helpers_1.uuid)();
    const teamId = await (0, database_1.insert)('INSERT INTO teams (uuid, name, slug, owner_id, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)', [teamUuid, 'SentryPulse Team', 'sentrypulse-team', userId, 'pro', (0, helpers_1.now)()]);
    console.log('✓ Created demo team');
    // Add user to team
    await (0, database_1.insert)('INSERT INTO team_users (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)', [teamId, userId, 'owner', (0, helpers_1.now)()]);
    // Create site
    const trackingCode = 'SP_' + crypto_1.default.randomBytes(6).toString('hex').toUpperCase();
    const siteId = await (0, database_1.insert)('INSERT INTO sites (team_id, name, domain, tracking_code, is_enabled, public_stats, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [teamId, 'Demo Site', 'demo.sentrypulse.com', trackingCode, true, true, (0, helpers_1.now)()]);
    console.log('✓ Created demo site for analytics');
    // Create monitor
    const monitorId = await (0, database_1.insert)('INSERT INTO monitors (team_id, name, url, type, method, `interval`, is_enabled, check_ssl, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [teamId, 'Main Website', 'https://example.com', 'https', 'GET', 60, true, true, (0, helpers_1.now)()]);
    console.log('✓ Created demo monitor');
    // Create notification channel
    await (0, database_1.insert)('INSERT INTO notification_channels (team_id, name, type, is_enabled, config, created_at) VALUES (?, ?, ?, ?, ?, ?)', [teamId, 'Default Email', 'email', true, JSON.stringify({ email: 'admin@sentrypulse.com' }), (0, helpers_1.now)()]);
    console.log('✓ Created notification channel');
    // Create status page
    const statusPageId = await (0, database_1.insert)('INSERT INTO status_pages (team_id, name, slug, is_public, created_at) VALUES (?, ?, ?, ?, ?)', [teamId, 'Public Status', 'public-status', true, (0, helpers_1.now)()]);
    console.log('✓ Created status page');
    // Add monitor to status page
    await (0, database_1.insert)('INSERT INTO status_page_monitors (status_page_id, monitor_id, display_order) VALUES (?, ?, ?)', [statusPageId, monitorId, 1]);
    console.log('\nDatabase seeded successfully!');
}
async function main() {
    try {
        await seed();
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=seed.js.map