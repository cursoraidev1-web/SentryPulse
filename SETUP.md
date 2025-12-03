# SentryPulse Setup Guide

Complete setup guide for deploying the SentryPulse platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sentrypulse
```

### 2. Environment Configuration

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update the following values:

```env
APP_NAME=SentryPulse
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Generate a random 32-character string
APP_KEY=base64:YOUR_GENERATED_KEY_HERE

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=sentrypulse
DB_USERNAME=sentrypulse
DB_PASSWORD=CHANGE_THIS_PASSWORD

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_FROM_ADDRESS=noreply@sentrypulse.com

# JWT
JWT_SECRET=YOUR_JWT_SECRET_HERE
JWT_TTL=60

# Optional: Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# Optional: WhatsApp
WHATSAPP_API_URL=your-whatsapp-api-url
WHATSAPP_API_KEY=your-api-key
```

#### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=SentryPulse
NEXT_PUBLIC_TRACKING_URL=http://localhost/tracker.js
```

### 3. Build and Deploy

#### Option A: Using Make (Recommended)

```bash
# Build Docker images
make build

# Start all services
make start

# Run migrations
make migrate

# Seed database with demo data
make seed
```

#### Option B: Using Docker Compose Directly

```bash
# Build and start services
docker compose up --build -d

# Run migrations
docker compose exec backend php artisan migrate

# Seed database
docker compose exec backend php artisan db:seed
```

#### Option C: Using Shell Scripts

```bash
# Build
chmod +x infrastructure/build.sh
./infrastructure/build.sh

# Deploy
chmod +x infrastructure/deploy.sh
./infrastructure/deploy.sh
```

### 4. Access the Platform

Once deployed, access:

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Tracking Script**: http://localhost/tracker.js

### 5. Default Login Credentials

After seeding the database:

- **Email**: admin@sentrypulse.com
- **Password**: password

**⚠️ Important**: Change these credentials immediately after first login!

## Development Setup

### Backend Development

```bash
cd backend

# Install dependencies
composer install

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Start development server
php artisan serve
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Queue Worker (Development)

```bash
cd backend
php artisan queue:work
```

### Monitor Checks (Development)

```bash
cd backend

# Run once
php artisan monitor:run

# Or use watch mode
watch -n 60 php artisan monitor:run
```

## Production Deployment

### 1. Server Requirements

- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **CPU**: 2+ cores
- **Storage**: 20GB+ SSD
- **Domain**: Configured with DNS pointing to server

### 2. SSL Configuration

Add SSL certificates to nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    
    # ... rest of configuration
}
```

### 3. Environment Variables

Update production environment variables:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
```

### 4. Database Backup

Set up automated backups:

```bash
# Add to crontab
0 2 * * * docker compose exec mysql mysqldump -u sentrypulse -psecret sentrypulse > /backup/sentrypulse_$(date +\%Y\%m\%d).sql
```

### 5. Monitoring

Monitor your deployment:

```bash
# View logs
docker compose logs -f

# Check container status
docker compose ps

# Check resource usage
docker stats
```

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Restart services
docker compose restart
```

### Database Connection Issues

```bash
# Check MySQL is running
docker compose ps mysql

# Check MySQL logs
docker compose logs mysql

# Test connection
docker compose exec backend php artisan db:show
```

### Queue Not Processing

```bash
# Check queue worker
docker compose logs queue

# Restart queue worker
docker compose restart queue

# Check queue size
docker compose exec backend php artisan queue:monitor
```

### Monitor Checks Not Running

```bash
# Check cron service
docker compose logs cron

# Manually run check
docker compose exec backend php artisan monitor:run

# Check crontab
docker compose exec cron cat /etc/crontabs/root
```

### Frontend Build Issues

```bash
# Rebuild frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

## Scaling

### Horizontal Scaling

#### Multiple Queue Workers

Edit `docker-compose.yml`:

```yaml
queue-1:
  # ... same config as queue
  
queue-2:
  # ... same config as queue
```

#### Load Balanced Backend

Use nginx upstream:

```nginx
upstream backend {
    server backend-1:9000;
    server backend-2:9000;
    server backend-3:9000;
}
```

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_monitors_last_checked ON monitors(last_checked_at);
CREATE INDEX idx_pageviews_viewed_at ON pageviews_raw(viewed_at);

-- Optimize tables
OPTIMIZE TABLE monitor_checks;
OPTIMIZE TABLE pageviews_raw;
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker compose build

# Restart services
docker compose up -d

# Run migrations
docker compose exec backend php artisan migrate
```

### Clear Cache

```bash
# Clear application cache
docker compose exec backend php artisan cache:clear

# Clear Redis
docker compose exec redis redis-cli FLUSHALL
```

### Database Maintenance

```bash
# Optimize database
docker compose exec backend php artisan db:optimize

# Clean old data
docker compose exec backend php artisan db:clean --days=90
```

## Security Checklist

- [ ] Change default database passwords
- [ ] Generate strong APP_KEY and JWT_SECRET
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable fail2ban
- [ ] Configure rate limiting
- [ ] Set up regular backups
- [ ] Update software regularly
- [ ] Monitor logs for suspicious activity
- [ ] Use strong passwords for all accounts

## Support

For help and support:

- **Documentation**: `/docs`
- **GitHub Issues**: Create an issue in the repository
- **Email**: support@sentrypulse.com

## License

Proprietary - SootheTech © 2025
