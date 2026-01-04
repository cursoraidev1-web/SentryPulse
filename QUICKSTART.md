# SentryPulse - Quick Start

Get up and running in 5 minutes! 🚀

## Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** 12+ installed and running
- **Redis** installed and running (optional, for queues)
- Ports 3000, 8000 available

## Installation (Without Docker)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE sentrypulse;
CREATE USER sentrypulse WITH PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE sentrypulse TO sentrypulse;
\q
```

### 3. Configure Environment

```bash
# Backend
cd backend
cp env.example.txt .env
# Edit .env with your database credentials

# Frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your API URL (http://localhost:8000/api)
```

**Backend `.env` example:**
```env
NODE_ENV=development
PORT=8000
APP_URL=http://localhost:8000

DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=sentrypulse
DB_USERNAME=postgres
DB_PASSWORD=secret

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key-change-this-in-production
JWT_TTL=1440

FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local` example:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_TRACKING_URL=http://localhost:8000/tracker.js
```

### 4. Run Database Migrations

You'll need to run the SQL migrations manually. The migration files are in `backend/database/migrations/`. Run them in order:

```bash
# Option 1: Use PostgreSQL command line
psql -U postgres -d sentrypulse -f backend/database/migrations/2024_01_01_000001_create_users_table.sql

# Option 2: Use a migration script (if you create one)
cd backend
node scripts/migrate.js
```

### 5. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Queue Worker (optional):**
```bash
cd backend
npm run queue
```

**Terminal 4 - Monitor Checks (optional, for cron):**
```bash
cd backend
npm run monitor
```

## Access

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/health

## Default Login

After running migrations and seeding:
```
Email: admin@sentrypulse.com
Password: password
```

⚠️ **Change these credentials immediately!**

## Quick Commands

```bash
# Backend
cd backend
npm start          # Start server
npm run dev        # Development mode with auto-reload
npm run queue      # Start queue worker
npm run monitor    # Run monitor checks

# Frontend
cd frontend
npm run dev        # Development server
npm run build      # Production build
npm start          # Production server
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

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # Mac/Linux

# Check database connection
psql -U postgres -d sentrypulse -c "SELECT 1"
```

### Database connection error
```bash
# Verify MySQL is running
mysql -u sentrypulse -p sentrypulse

# Check .env has correct credentials
cat backend/.env
```

### Frontend can't reach API
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify .env.local has correct API_URL
cat frontend/.env.local
```

### Module not found errors
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

For production use:

1. Update `backend/.env`:
   - Set `NODE_ENV=production`
   - Generate strong `JWT_SECRET`
   - Configure real database credentials
   - Set up mail server

2. Update `frontend/.env.local`:
   - Set production API URL
   - Set production domain

3. Build frontend:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

4. Use a process manager (PM2 recommended):
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name sentrypulse-api
   pm2 start scripts/queue.js --name sentrypulse-queue
   ```

5. Set up backups:
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
