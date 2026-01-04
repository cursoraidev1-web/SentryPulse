# Local Setup Guide (Without Docker)

This guide will help you set up SentryPulse to run locally without Docker.

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
3. **Redis** (optional, for queues) - [Download](https://redis.io/download)

## Step-by-Step Setup

### 1. Install Node.js Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set Up PostgreSQL Database

Start PostgreSQL and create the database:

```bash
# Connect to PostgreSQL (Windows: may need to use psql from PostgreSQL bin directory)
psql -U postgres

# Create database
CREATE DATABASE sentrypulse;

# Create user (optional, or use postgres)
CREATE USER sentrypulse WITH PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE sentrypulse TO sentrypulse;

# Exit PostgreSQL
\q
```

**Windows Note:** If `psql` is not in your PATH, use the full path:
```bash
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

### 3. Run Database Migrations

The migration SQL files are in `backend/database/migrations/`. Run them in order:

**Option 1: Using PostgreSQL command line**
```bash
# Run each migration file
psql -U postgres -d sentrypulse -f backend/database/migrations/2024_01_01_000001_create_users_table.sql
psql -U postgres -d sentrypulse -f backend/database/migrations/2024_01_01_000002_create_teams_table.sql
# ... continue for all migration files
```

**Option 2: Run all at once (if you combine them)**
```bash
# Windows PowerShell
Get-Content backend/database/migrations/*.sql | psql -U postgres -d sentrypulse

# Linux/Mac
cat backend/database/migrations/*.sql | psql -U postgres -d sentrypulse
```

### 4. Configure Environment Variables

**Backend `.env`:**
```bash
cd backend
cp env.example.txt .env
```

Edit `backend/.env`:
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

**Frontend `.env.local`:**
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_TRACKING_URL=http://localhost:8000/tracker.js
```

### 5. Start Redis (Optional)

If you want to use the queue system:

```bash
# Windows (if installed)
redis-server

# Mac (using Homebrew)
brew services start redis

# Linux
sudo systemctl start redis
```

### 6. Start the Backend

```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
✓ Database connected
✓ Server running on port 8000
✓ Environment: development
```

### 7. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3000
```

### 8. Optional: Start Queue Worker

In another terminal (if using Redis):

```bash
cd backend
npm run queue
```

### 9. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/health

## Verify Installation

1. Check backend health:
   ```bash
   curl http://localhost:8000/health
   ```

2. Test API endpoint:
   ```bash
   curl http://localhost:8000/api/auth/me
   # Should return: {"success":false,"message":"Unauthorized"}
   ```

3. Open frontend in browser: http://localhost:3000

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8000
# Kill the process using the PID shown

# Mac/Linux
lsof -i :8000
kill -9 <PID>
```

### Database Connection Error

1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres -d sentrypulse -c "SELECT 1"
   ```

2. Check credentials in `backend/.env`

3. Test connection:
   ```bash
   psql -U postgres -d sentrypulse
   ```

### Module Not Found

```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Can't Connect to Backend

1. Verify backend is running on port 8000
2. Check `frontend/.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check CORS settings in `backend/server.js`

## Development Workflow

1. **Backend changes**: The server will auto-reload if using `npm run dev`
2. **Frontend changes**: Next.js will hot-reload automatically
3. **Database changes**: Run new migrations manually

## Production Build

```bash
# Build frontend
cd frontend
npm run build
npm start

# Backend (use PM2)
npm install -g pm2
cd backend
pm2 start server.js --name sentrypulse-api
pm2 start scripts/queue.js --name sentrypulse-queue
```

## Next Steps

- Create your first user account
- Set up a monitor
- Configure notification channels
- See [QUICKSTART.md](../QUICKSTART.md) for more details


