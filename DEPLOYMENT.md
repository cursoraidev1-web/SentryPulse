# SentryPulse Deployment Guide

Complete deployment guide for Vercel/Netlify (Frontend), Supabase (Database), and Render (Backend).

## 📋 Overview

This guide covers deploying SentryPulse to:
- **Frontend**: Vercel or Netlify
- **Database**: Supabase (PostgreSQL)
- **Backend**: Render
- **File Storage**: Supabase Storage (for avatars/logos)

---

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: `sentrypulse`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 1.2 Get Database Connection Details

In your Supabase dashboard:
1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy the **URI** connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

**Or get individual values:**
- **Host**: `db.[PROJECT-REF].supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: (the one you set during project creation)

### 1.3 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `backend/database/schema.sql`
4. Paste and click **Run**
5. Verify tables were created (check **Table Editor**)

### 1.4 Set Up Supabase Storage (Optional - for file uploads)

1. Go to **Storage** in Supabase dashboard
2. Create buckets:
   - `avatars` (public: true)
   - `logos` (public: true)
3. Set up RLS policies if needed

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Prepare Backend for Render

1. **Update database connection** to support Supabase connection string
2. **Create `render.yaml`** (optional, for infrastructure as code)

### 2.2 Deploy via Render Dashboard

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `sentrypulse-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend` (if deploying from monorepo)

### 2.3 Environment Variables (Render)

Add these in Render dashboard → **Environment**:

```env
NODE_ENV=production
PORT=10000
APP_URL=https://your-backend-name.onrender.com

# Supabase Database
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password

# Or use connection string (if supported)
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Redis (optional - use Upstash Redis or Render Redis)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=generate-a-strong-random-secret-here
JWT_TTL=1440

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app

# Supabase Storage (for file uploads)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_STORAGE_BUCKET=avatars
```

### 2.4 Update Database Connection Code

The backend needs to support Supabase connection string. See updated `backend/src/Core/database.js` in the codebase.

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (default)

### 3.2 Environment Variables (Vercel)

In Vercel dashboard → **Settings** → **Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com/api
NEXT_PUBLIC_TRACKING_URL=https://your-backend-name.onrender.com/tracker.js
```

### 3.3 Deploy

Click **Deploy**. Vercel will automatically:
- Install dependencies
- Build the Next.js app
- Deploy to production

---

## 🌐 Step 3 Alternative: Deploy Frontend to Netlify

### 3.1 Deploy via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next` (or `frontend/out` if using static export)

### 3.2 Environment Variables (Netlify)

In Netlify dashboard → **Site settings** → **Environment variables**:

```env
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com/api
NEXT_PUBLIC_TRACKING_URL=https://your-backend-name.onrender.com/tracker.js
```

### 3.3 Netlify Configuration File

Create `netlify.toml` in `frontend/`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 🔧 Step 4: Update Code for Cloud Deployment

### 4.1 Update Database Connection

The database connection needs to support Supabase connection strings. See the updated `database.js` file.

### 4.2 Update CORS Settings

Backend CORS should allow your frontend domain:

```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://your-app.vercel.app',
    'https://your-app.netlify.app'
  ],
  credentials: true
}));
```

### 4.3 File Upload Handling (if needed)

If you need file uploads (avatars, logos), integrate Supabase Storage:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
```

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend

```bash
curl https://your-backend.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 5.2 Test Frontend

1. Visit your Vercel/Netlify URL
2. Try to register/login
3. Check browser console for errors

### 5.3 Test Database Connection

Check Render logs to ensure database connection is successful.

---

## 🔄 Step 6: Set Up Background Jobs (Optional)

### Option A: Render Cron Jobs

1. In Render dashboard, create a **Background Worker**
2. Set command: `cd backend && node scripts/monitor.js`
3. Set schedule: `*/5 * * * *` (every 5 minutes)

### Option B: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)

Set up webhook to: `https://your-backend.onrender.com/api/monitors/check-all`

---

## 📝 Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
APP_URL=https://your-backend.onrender.com
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-password
JWT_SECRET=your-secret
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel/Netlify)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_TRACKING_URL=https://your-backend.onrender.com/tracker.js
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs
- Verify database connection string
- Ensure PORT is set correctly (Render uses PORT env var)

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

### Database connection errors
- Verify Supabase credentials
- Check if database is accessible from Render's IP
- Supabase allows connections from anywhere by default

### CORS errors
- Update `FRONTEND_URL` in backend env vars
- Add your frontend domain to CORS allowed origins

---

## 🔐 Security Checklist

- [ ] Use strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)
- [ ] Set `NODE_ENV=production`
- [ ] Enable Supabase Row Level Security (RLS) if needed
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Vercel/Netlify/Render)
- [ ] Set up rate limiting (already configured in backend)
- [ ] Review Supabase database access policies

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

---

## 🎉 You're Done!

Your SentryPulse app should now be live:
- Frontend: `https://your-app.vercel.app` or `https://your-app.netlify.app`
- Backend: `https://your-backend.onrender.com`
- Database: Supabase PostgreSQL

Default login (if you seeded the database):
- Email: `admin@sentrypulse.com`
- Password: `password`

**⚠️ Change these credentials immediately!**



