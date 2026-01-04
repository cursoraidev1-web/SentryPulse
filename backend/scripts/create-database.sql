-- Create SentryPulse database
CREATE DATABASE sentrypulse;

-- Create dedicated user (optional - you can use postgres user if preferred)
CREATE USER sentrypulse WITH PASSWORD 'password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sentrypulse TO sentrypulse;

-- Connect to the new database to set up schema privileges
\c sentrypulse

-- Grant schema privileges (needed for PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO sentrypulse;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sentrypulse;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sentrypulse;



