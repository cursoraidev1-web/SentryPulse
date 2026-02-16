import { getPool } from '../config/database';

export const migrations = [
  {
    name: '001_create_users_table',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,  -- Fixed: 191 length
        email_verified_at TIMESTAMP NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) NULL,
        timezone VARCHAR(50) DEFAULT 'UTC',
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS users;'
  },
  {
    name: '002_create_teams_table',
    up: `
      CREATE TABLE IF NOT EXISTS teams (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,   -- Fixed: 191 length
        owner_id BIGINT UNSIGNED NOT NULL,
        plan VARCHAR(50) DEFAULT 'free',
        plan_expires_at TIMESTAMP NULL,
        settings TEXT NULL,                  -- Fixed: JSON -> TEXT
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_owner_id (owner_id),
        INDEX idx_slug (slug),
        INDEX idx_plan (plan)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS teams;'
  },
  {
    name: '003_create_team_users_table',
    up: `
      CREATE TABLE IF NOT EXISTS team_users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        team_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        role ENUM('owner', 'admin', 'member') DEFAULT 'member',
        invited_by BIGINT UNSIGNED NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_team_user (team_id, user_id),
        INDEX idx_team_id (team_id),
        INDEX idx_user_id (user_id),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS team_users;'
  },
  {
    name: '004_create_monitors_table',
    up: `
      CREATE TABLE IF NOT EXISTS monitors (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        team_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        type ENUM('http', 'https', 'ping', 'dns') DEFAULT 'https',
        method ENUM('GET', 'POST', 'HEAD') DEFAULT 'GET',
        \`interval\` INT UNSIGNED DEFAULT 60,
        timeout INT UNSIGNED DEFAULT 30,
        status ENUM('up', 'down', 'paused') DEFAULT 'up',
        is_enabled BOOLEAN DEFAULT TRUE,
        check_ssl BOOLEAN DEFAULT TRUE,
        check_keyword VARCHAR(255) NULL,
        expected_status_code INT UNSIGNED DEFAULT 200,
        headers TEXT NULL,                   -- Fixed: JSON -> TEXT
        body TEXT NULL,
        last_checked_at TIMESTAMP NULL,
        last_status VARCHAR(20) NULL,
        last_response_time INT UNSIGNED NULL,
        uptime_percentage DECIMAL(5, 2) DEFAULT 100.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        INDEX idx_team_id (team_id),
        INDEX idx_status (status),
        INDEX idx_is_enabled (is_enabled),
        INDEX idx_last_checked_at (last_checked_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS monitors;'
  },
  {
    name: '005_create_monitor_checks_table',
    up: `
      CREATE TABLE IF NOT EXISTS monitor_checks (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        monitor_id BIGINT UNSIGNED NOT NULL,
        status ENUM('success', 'failure', 'timeout', 'error') NOT NULL,
        status_code INT UNSIGNED NULL,
        response_time INT UNSIGNED NULL,
        error_message TEXT NULL,
        ssl_valid BOOLEAN NULL,
        ssl_expires_at TIMESTAMP NULL,
        dns_resolved BOOLEAN NULL,
        keyword_found BOOLEAN NULL,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
        INDEX idx_monitor_id (monitor_id),
        INDEX idx_status (status),
        INDEX idx_checked_at (checked_at),
        INDEX idx_monitor_checked (monitor_id, checked_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS monitor_checks;'
  },
  {
    name: '006_create_incidents_table',
    up: `
      CREATE TABLE IF NOT EXISTS incidents (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        monitor_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('investigating', 'identified', 'monitoring', 'resolved') DEFAULT 'investigating',
        severity ENUM('critical', 'major', 'minor') DEFAULT 'major',
        started_at TIMESTAMP NOT NULL,
        resolved_at TIMESTAMP NULL,
        duration_seconds INT UNSIGNED NULL,
        metadata TEXT NULL,                  -- Fixed: JSON -> TEXT
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
        INDEX idx_monitor_id (monitor_id),
        INDEX idx_status (status),
        INDEX idx_severity (severity),
        INDEX idx_started_at (started_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS incidents;'
  },
  {
    name: '007_create_notification_channels_table',
    up: `
      CREATE TABLE IF NOT EXISTS notification_channels (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        team_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        type ENUM('email', 'whatsapp', 'telegram', 'webhook') NOT NULL,
        is_enabled BOOLEAN DEFAULT TRUE,
        config TEXT NOT NULL,                -- Fixed: JSON -> TEXT
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        INDEX idx_team_id (team_id),
        INDEX idx_type (type),
        INDEX idx_is_enabled (is_enabled)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS notification_channels;'
  },
  {
    name: '008_create_alerts_sent_table',
    up: `
      CREATE TABLE IF NOT EXISTS alerts_sent (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        incident_id BIGINT UNSIGNED NOT NULL,
        notification_channel_id BIGINT UNSIGNED NOT NULL,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        error_message TEXT NULL,
        sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
        FOREIGN KEY (notification_channel_id) REFERENCES notification_channels(id) ON DELETE CASCADE,
        INDEX idx_incident_id (incident_id),
        INDEX idx_channel_id (notification_channel_id),
        INDEX idx_status (status),
        INDEX idx_sent_at (sent_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS alerts_sent;'
  },
  {
    name: '009_create_status_pages_table',
    up: `
      CREATE TABLE IF NOT EXISTS status_pages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        team_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,   -- Fixed: 191 length
        domain VARCHAR(255) NULL,
        logo_url VARCHAR(500) NULL,
        is_public BOOLEAN DEFAULT TRUE,
        theme TEXT NULL,                     -- Fixed: JSON -> TEXT
        custom_css TEXT NULL,
        custom_html TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        INDEX idx_team_id (team_id),
        INDEX idx_slug (slug),
        INDEX idx_is_public (is_public)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS status_pages;'
  },
  {
    name: '010_create_status_page_monitors_table',
    up: `
      CREATE TABLE IF NOT EXISTS status_page_monitors (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        status_page_id BIGINT UNSIGNED NOT NULL,
        monitor_id BIGINT UNSIGNED NOT NULL,
        display_order INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (status_page_id) REFERENCES status_pages(id) ON DELETE CASCADE,
        FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
        UNIQUE KEY unique_status_monitor (status_page_id, monitor_id),
        INDEX idx_status_page_id (status_page_id),
        INDEX idx_monitor_id (monitor_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS status_page_monitors;'
  },
  {
    name: '011_create_sites_table',
    up: `
      CREATE TABLE IF NOT EXISTS sites (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        team_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        tracking_code VARCHAR(50) NOT NULL UNIQUE,
        is_enabled BOOLEAN DEFAULT TRUE,
        timezone VARCHAR(50) DEFAULT 'UTC',
        public_stats BOOLEAN DEFAULT FALSE,
        settings TEXT NULL,                  -- Fixed: JSON -> TEXT
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        INDEX idx_team_id (team_id),
        INDEX idx_tracking_code (tracking_code),
        INDEX idx_domain (domain),
        INDEX idx_is_enabled (is_enabled)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS sites;'
  },
  {
    name: '012_create_pageviews_raw_table',
    up: `
      CREATE TABLE IF NOT EXISTS pageviews_raw (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        site_id BIGINT UNSIGNED NOT NULL,
        visitor_id VARCHAR(64) NOT NULL,
        session_id VARCHAR(64) NOT NULL,
        url VARCHAR(1000) NOT NULL,
        referrer VARCHAR(1000) NULL,
        utm_source VARCHAR(255) NULL,
        utm_medium VARCHAR(255) NULL,
        utm_campaign VARCHAR(255) NULL,
        browser VARCHAR(100) NULL,
        os VARCHAR(100) NULL,
        device_type ENUM('desktop', 'mobile', 'tablet') NULL,
        country_code CHAR(2) NULL,
        screen_width INT UNSIGNED NULL,
        screen_height INT UNSIGNED NULL,
        viewed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
        INDEX idx_site_id (site_id),
        INDEX idx_visitor_id (visitor_id),
        INDEX idx_session_id (session_id),
        INDEX idx_viewed_at (viewed_at),
        INDEX idx_site_date (site_id, viewed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS pageviews_raw;'
  },
  {
    name: '013_create_events_raw_table',
    up: `
      CREATE TABLE IF NOT EXISTS events_raw (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        site_id BIGINT UNSIGNED NOT NULL,
        visitor_id VARCHAR(64) NOT NULL,
        session_id VARCHAR(64) NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        properties TEXT NULL,                -- Fixed: JSON -> TEXT
        url VARCHAR(1000) NULL,
        occurred_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
        INDEX idx_site_id (site_id),
        INDEX idx_visitor_id (visitor_id),
        INDEX idx_session_id (session_id),
        INDEX idx_event_name (event_name),
        INDEX idx_occurred_at (occurred_at),
        INDEX idx_site_date (site_id, occurred_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS events_raw;'
  },
  {
    name: '014_create_pageviews_daily_table',
    up: `
      CREATE TABLE IF NOT EXISTS pageviews_daily (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        site_id BIGINT UNSIGNED NOT NULL,
        date DATE NOT NULL,
        pageviews INT UNSIGNED DEFAULT 0,
        unique_visitors INT UNSIGNED DEFAULT 0,
        sessions INT UNSIGNED DEFAULT 0,
        bounce_rate DECIMAL(5, 2) DEFAULT 0.00,
        avg_session_duration INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
        UNIQUE KEY unique_site_date (site_id, date),
        INDEX idx_site_id (site_id),
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS pageviews_daily;'
  },
  {
    name: '015_create_events_daily_table',
    up: `
      CREATE TABLE IF NOT EXISTS events_daily (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        site_id BIGINT UNSIGNED NOT NULL,
       event_name VARCHAR(191) NOT NULL,
        date DATE NOT NULL,
        count INT UNSIGNED DEFAULT 0,
        unique_users INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
        UNIQUE KEY unique_site_event_date (site_id, event_name, date),
        INDEX idx_site_id (site_id),
        INDEX idx_event_name (event_name),
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: 'DROP TABLE IF EXISTS events_daily;'
  },
];

export const runMigrations = async () => {
  const pool = getPool();
  
  for (const migration of migrations) {
    try {
      console.log(`Running migration: ${migration.name}`);
      await pool.query(migration.up);
      console.log(`✓ ${migration.name}`);
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`- ${migration.name} (already exists)`);
      } else {
        console.error(`✗ ${migration.name}:`, error.message);
        throw error;
      }
    }
  }
  
  console.log('Migrations completed successfully!');
};