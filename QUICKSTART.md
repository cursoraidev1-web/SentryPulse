# SentryPulse - Quick Start

Get up and running in 5 minutes! 🚀

## Prerequisites

- Docker & Docker Compose installed
- Ports 80, 3000, 3306, 6379, 8000 available

## Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd sentrypulse

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Generate keys (optional but recommended)
# APP_KEY and JWT_SECRET in backend/.env

# 4. Start everything
docker compose up --build -d

# 5. Wait for services to be ready (about 30 seconds)
sleep 30

# 6. Run database migrations
docker compose exec backend php artisan migrate

# 7. Seed with demo data
docker compose exec backend php artisan db:seed
```

## Access

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:8000/api
- **Tracker**: http://localhost/tracker.js

## Default Login

```
Email: admin@sentrypulse.com
Password: password
```

⚠️ **Change these credentials immediately!**

## Quick Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Check status
docker compose ps

# Run migrations
docker compose exec backend php artisan migrate

# Clear cache
docker compose exec backend php artisan cache:clear
```

## Using Make (Easier!)

```bash
make help      # Show all commands
make build     # Build images
make start     # Start services
make stop      # Stop services
make logs      # View logs
make migrate   # Run migrations
make seed      # Seed database
make clean     # Remove everything
```

## First Steps After Login

1. **Create a Monitor**
   - Go to Monitors → Add Monitor
   - Enter URL to monitor
   - Set check interval
   - Save

2. **Add Analytics Site**
   - Go to Analytics → Add Site
   - Enter website domain
   - Copy tracking code
   - Add to your website

3. **Create Status Page**
   - Go to Status Pages → Create
   - Add monitors to display
   - Share public URL

4. **Set Up Notifications**
   - Go to Team → Notification Channels
   - Add email, Telegram, or webhook
   - Configure incident alerts

## Troubleshooting

### Services won't start
```bash
# Check for port conflicts
docker compose down
docker compose up -d
docker compose logs
```

### Database connection error
```bash
# Wait longer for MySQL to start
sleep 10
docker compose exec backend php artisan migrate
```

### Frontend can't reach API
```bash
# Check backend is running
curl http://localhost:8000/api/auth/me

# Verify .env.local has correct API_URL
cat frontend/.env.local
```

## Production Deployment

For production use:

1. Update `backend/.env`:
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Generate strong `APP_KEY` and `JWT_SECRET`
   - Configure real database credentials
   - Set up mail server

2. Update `frontend/.env.local`:
   - Set production API URL
   - Set production domain

3. Configure SSL:
   - Add certificates to nginx config
   - Update nginx.conf for HTTPS

4. Set up backups:
   - Database backups
   - Configuration backups

See [SETUP.md](SETUP.md) for detailed production deployment.

## Support

- **Documentation**: Check `/docs` folder
- **Setup Guide**: [SETUP.md](SETUP.md)
- **API Docs**: [docs/api.md](docs/api.md)
- **Architecture**: [docs/architecture.md](docs/architecture.md)

## What's Included

✅ Website uptime monitoring  
✅ SSL & DNS checks  
✅ Incident management  
✅ Multi-channel alerts (Email, Telegram, WhatsApp, Webhook)  
✅ Public status pages  
✅ Privacy-focused analytics  
✅ Custom event tracking  
✅ Team collaboration  
✅ Role-based access control  
✅ Usage tracking & billing  

**Everything works out of the box!** 🎉

---

**Next**: Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for complete feature list.
