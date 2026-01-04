-- SentryPulse Database Schema (PostgreSQL)
-- Run this file to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Teams table
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) DEFAULT 'free',
    plan_expires_at TIMESTAMP NULL,
    settings JSONB NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_plan ON teams(plan);

-- Team users (many-to-many)
CREATE TABLE team_users (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    invited_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_users_team_id ON team_users(team_id);
CREATE INDEX idx_team_users_user_id ON team_users(user_id);
CREATE INDEX idx_team_users_role ON team_users(role);

-- Monitors table
CREATE TABLE monitors (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(20) DEFAULT 'https' CHECK (type IN ('http', 'https', 'ping', 'dns')),
    method VARCHAR(10) DEFAULT 'GET' CHECK (method IN ('GET', 'POST', 'HEAD')),
    interval INTEGER DEFAULT 60,
    timeout INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'up' CHECK (status IN ('up', 'down', 'paused', 'unknown')),
    is_enabled BOOLEAN DEFAULT TRUE,
    check_ssl BOOLEAN DEFAULT TRUE,
    check_keyword VARCHAR(255) NULL,
    expected_status_code INTEGER DEFAULT 200,
    headers JSONB NULL,
    body TEXT NULL,
    last_checked_at TIMESTAMP NULL,
    last_status VARCHAR(20) NULL,
    last_response_time INTEGER NULL,
    uptime_percentage DECIMAL(5, 2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitors_team_id ON monitors(team_id);
CREATE INDEX idx_monitors_status ON monitors(status);
CREATE INDEX idx_monitors_is_enabled ON monitors(is_enabled);
CREATE INDEX idx_monitors_last_checked_at ON monitors(last_checked_at);

-- Monitor checks table
CREATE TABLE monitor_checks (
    id BIGSERIAL PRIMARY KEY,
    monitor_id BIGINT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure', 'timeout', 'error')),
    status_code INTEGER NULL,
    response_time INTEGER NULL,
    error_message TEXT NULL,
    ssl_valid BOOLEAN NULL,
    ssl_expires_at TIMESTAMP NULL,
    dns_resolved BOOLEAN NULL,
    keyword_found BOOLEAN NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitor_checks_monitor_id ON monitor_checks(monitor_id);
CREATE INDEX idx_monitor_checks_status ON monitor_checks(status);
CREATE INDEX idx_monitor_checks_checked_at ON monitor_checks(checked_at);
CREATE INDEX idx_monitor_checks_monitor_checked ON monitor_checks(monitor_id, checked_at);

-- Incidents table
CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    monitor_id BIGINT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
    severity VARCHAR(20) DEFAULT 'major' CHECK (severity IN ('minor', 'major', 'critical')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    duration_seconds INTEGER NULL,
    metadata JSONB NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_monitor_id ON incidents(monitor_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_started_at ON incidents(started_at);

-- Sites table (for analytics)
CREATE TABLE sites (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    tracking_code VARCHAR(50) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    public_stats BOOLEAN DEFAULT FALSE,
    settings JSONB NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sites_team_id ON sites(team_id);
CREATE INDEX idx_sites_tracking_code ON sites(tracking_code);

-- Pageviews raw table
CREATE TABLE pageviews_raw (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    referrer TEXT NULL,
    utm_source VARCHAR(255) NULL,
    utm_medium VARCHAR(255) NULL,
    utm_campaign VARCHAR(255) NULL,
    browser VARCHAR(100) NULL,
    os VARCHAR(100) NULL,
    device_type VARCHAR(50) NULL,
    country_code VARCHAR(2) NULL,
    screen_width INTEGER NULL,
    screen_height INTEGER NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pageviews_raw_site_id ON pageviews_raw(site_id);
CREATE INDEX idx_pageviews_raw_viewed_at ON pageviews_raw(viewed_at);
CREATE INDEX idx_pageviews_raw_visitor_id ON pageviews_raw(visitor_id);

-- Events raw table
CREATE TABLE events_raw (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    properties JSONB NULL,
    url TEXT NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_raw_site_id ON events_raw(site_id);
CREATE INDEX idx_events_raw_occurred_at ON events_raw(occurred_at);
CREATE INDEX idx_events_raw_event_name ON events_raw(event_name);

-- Pageviews daily (aggregated)
CREATE TABLE pageviews_daily (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pageviews INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    UNIQUE(site_id, date)
);

CREATE INDEX idx_pageviews_daily_site_id ON pageviews_daily(site_id);
CREATE INDEX idx_pageviews_daily_date ON pageviews_daily(date);

-- Events daily (aggregated)
CREATE TABLE events_daily (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    UNIQUE(site_id, event_name, date)
);

CREATE INDEX idx_events_daily_site_id ON events_daily(site_id);
CREATE INDEX idx_events_daily_date ON events_daily(date);

-- Status pages table
CREATE TABLE status_pages (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    is_public BOOLEAN DEFAULT TRUE,
    logo_url VARCHAR(500) NULL,
    domain VARCHAR(255) NULL,
    theme JSONB NULL,
    custom_css TEXT NULL,
    custom_html TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_pages_team_id ON status_pages(team_id);
CREATE INDEX idx_status_pages_slug ON status_pages(slug);

-- Status page monitors (many-to-many)
CREATE TABLE status_page_monitors (
    id BIGSERIAL PRIMARY KEY,
    status_page_id BIGINT NOT NULL REFERENCES status_pages(id) ON DELETE CASCADE,
    monitor_id BIGINT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    UNIQUE(status_page_id, monitor_id)
);

CREATE INDEX idx_status_page_monitors_status_page_id ON status_page_monitors(status_page_id);
CREATE INDEX idx_status_page_monitors_monitor_id ON status_page_monitors(monitor_id);

-- Notification channels table
CREATE TABLE notification_channels (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'telegram', 'whatsapp', 'webhook', 'slack')),
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_channels_team_id ON notification_channels(team_id);

-- Alerts sent table
CREATE TABLE alerts_sent (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    notification_channel_id BIGINT NOT NULL REFERENCES notification_channels(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_sent_incident_id ON alerts_sent(incident_id);
CREATE INDEX idx_alerts_sent_status ON alerts_sent(status);

-- API keys table
CREATE TABLE api_keys (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(50) NOT NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_team_id ON api_keys(team_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- Subscriptions table
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id)
);

CREATE INDEX idx_subscriptions_team_id ON subscriptions(team_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Usage records table
CREATE TABLE usage_records (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_records_team_id ON usage_records(team_id);
CREATE INDEX idx_usage_records_period ON usage_records(period_start, period_end);
CREATE INDEX idx_usage_records_metric_type ON usage_records(metric_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_users_updated_at BEFORE UPDATE ON team_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON monitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_status_pages_updated_at BEFORE UPDATE ON status_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_channels_updated_at BEFORE UPDATE ON notification_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



