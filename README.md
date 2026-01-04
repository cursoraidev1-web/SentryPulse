# SentryPulse

A comprehensive SaaS platform for website monitoring, analytics, and incident management.

## Features

- **Uptime Monitoring**: HTTP/HTTPS health checks with SSL and DNS validation
- **Incident Management**: Automatic incident creation, tracking, and resolution
- **Multi-Channel Alerts**: Email, WhatsApp, Telegram, and webhook notifications
- **Public Status Pages**: Branded status pages for your services
- **Privacy-Focused Analytics**: GDPR-compliant website analytics and event tracking
- **Team Collaboration**: Multi-user teams with role-based access control
- **Usage-Based Billing**: Flexible plans with usage tracking and limits

---

## 🚀 Deployment Guide

This guide covers deploying SentryPulse to:
- **Frontend**: Vercel or Netlify
- **Database**: Supabase (PostgreSQL)
- **Backend**: Render

---

## 📋 Prerequisites

- GitHub account with this repository
- Supabase account ([supabase.com](https://supabase.com))
- Render account ([render.com](https://render.com))
- Vercel account ([vercel.com](https://vercel.com)) OR Netlify account ([netlify.com](https://netlify.com))

---

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `sentrypulse`
   - **Database Password**: (save this securely - you'll need it!)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 1.2 Get Database Connection Details

In your Supabase dashboard:
1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy the **URI** connection string

It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**Or get individual values:**
- **Host**: `db.[PROJECT-REF].supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: (the one you set during project creation)

### 1.3 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `backend/database/schema.sql` from this repository
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Verify tables were created (check **Table Editor** in sidebar)

### 1.4 Set Up Supabase Storage (Optional - for file uploads)

If you need file uploads (avatars, logos):
1. Go to **Storage** in Supabase dashboard
2. Create buckets:
   - `avatars` (set to public: true)
   - `logos` (set to public: true)

---

## Step 2: Deploy Backend to Render

### 2.1 Connect Repository

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New** → **Web Service**
3. Connect your GitHub account
4. Select this repository (`sentryPulse`)

### 2.2 Configure Service

Fill in the following:
- **Name**: `sentrypulse-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.3 Set Environment Variables

In the **Environment** section, add these variables:

```env
NODE_ENV=production
PORT=10000
APP_URL=https://your-backend-name.onrender.com

# Database - Use connection string (recommended)
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres

# OR use individual parameters:
# DB_HOST=db.YOUR-PROJECT-REF.supabase.co
# DB_PORT=5432
# DB_DATABASE=postgres
# DB_USERNAME=postgres
# DB_PASSWORD=YOUR-PASSWORD

# JWT Secret (generate a strong random string)
JWT_SECRET=your-strong-random-secret-here
JWT_TTL=1440

# Frontend URL (for CORS) - Update after deploying frontend
FRONTEND_URL=https://your-frontend.vercel.app

# Redis (Optional - if you need queues)
# REDIS_HOST=your-redis-host
# REDIS_PORT=6379
# REDIS_PASSWORD=your-redis-password

# Supabase Storage (Optional - if using file uploads)
# SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
# SUPABASE_KEY=your-supabase-anon-key
# SUPABASE_STORAGE_BUCKET=avatars
```

**Generate JWT Secret:**
```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2.4 Deploy

1. Click **Create Web Service**
2. Render will build and deploy your backend
3. Wait for deployment to complete (~5 minutes)
4. Copy your backend URL (e.g., `https://sentrypulse-backend.onrender.com`)

### 2.5 Test Backend

```bash
curl https://your-backend-name.onrender.com/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Select this repository

### 3.2 Configure Project

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### 3.3 Set Environment Variables

In **Environment Variables**, add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com/api
NEXT_PUBLIC_TRACKING_URL=https://your-backend-name.onrender.com/tracker.js
```

**Important**: Replace `your-backend-name.onrender.com` with your actual Render backend URL.

### 3.4 Deploy

1. Click **Deploy**
2. Vercel will automatically build and deploy
3. Wait for deployment (~2 minutes)
4. Copy your frontend URL (e.g., `https://sentrypulse.vercel.app`)

### 3.5 Update Backend CORS

Go back to Render and update the `FRONTEND_URL` environment variable:
```env
FRONTEND_URL=https://your-frontend.vercel.app
```

Then restart the service in Render.

---

## Step 3 Alternative: Deploy Frontend to Netlify

### 3.1 Connect Repository

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub account
4. Select this repository

### 3.2 Configure Build

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/.next`

### 3.3 Set Environment Variables

In **Site settings** → **Environment variables**, add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com/api
NEXT_PUBLIC_TRACKING_URL=https://your-backend-name.onrender.com/tracker.js
```

### 3.4 Deploy

1. Click **Deploy site**
2. Wait for deployment (~2 minutes)
3. Copy your frontend URL (e.g., `https://sentrypulse.netlify.app`)

### 3.5 Update Backend CORS

Go back to Render and update the `FRONTEND_URL` environment variable:
```env
FRONTEND_URL=https://your-frontend.netlify.app
```

Then restart the service in Render.

---

## ✅ Verify Deployment

### Test Backend
```bash
curl https://your-backend.onrender.com/health
```

### Test Frontend
1. Visit your Vercel/Netlify URL
2. Try to register a new account
3. Check browser console (F12) for any errors

### Test Database Connection
- Check Render logs to ensure database connection is successful
- Look for: `✓ Database connected`

---

## 🔧 Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your-generated-secret
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
- **Check Render logs**: Go to your service → **Logs** tab
- **Verify DATABASE_URL**: Make sure it's correct and includes password
- **Check PORT**: Render uses `PORT` environment variable automatically
- **Database connection**: Verify Supabase credentials are correct

### Frontend can't connect to backend
- **Verify API URL**: Check `NEXT_PUBLIC_API_URL` matches your backend URL exactly
- **Check CORS**: Ensure `FRONTEND_URL` in backend matches your frontend URL
- **Browser console**: Open DevTools (F12) and check for CORS errors
- **Network tab**: Verify API requests are going to correct URL

### Database connection errors
- **Verify Supabase credentials**: Double-check connection string
- **Check schema**: Ensure `schema.sql` was run successfully
- **Supabase logs**: Check Supabase dashboard → **Logs** for connection attempts
- **Firewall**: Supabase allows connections from anywhere by default

### CORS errors
- **Update FRONTEND_URL**: Make sure it matches your exact frontend URL (with https://)
- **Multiple origins**: You can set `FRONTEND_URLS` with comma-separated URLs
- **Restart backend**: After changing CORS settings, restart the Render service

### Build errors
- **Node version**: Ensure Node.js 18+ is being used
- **Dependencies**: Check build logs for missing packages
- **Environment variables**: Verify all required variables are set

---

## 🔐 Security Checklist

- [ ] Use strong `JWT_SECRET` (32+ characters, random)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use HTTPS (automatic on Vercel/Netlify/Render)
- [ ] Keep Supabase password secure
- [ ] Review Supabase Row Level Security (RLS) policies if needed
- [ ] Change default admin credentials after first login
- [ ] Enable rate limiting (already configured in backend)

---

## 📚 Local Development

If you want to run locally for development:

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (or use Supabase locally)
- Redis (optional)

### Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   
   cd ../frontend
   npm install
   ```

2. **Set up database:**
   - Use Supabase connection string, or
   - Set up local PostgreSQL and run `backend/database/schema.sql`

3. **Configure environment:**
   - Backend: Copy `backend/env.example.txt` to `backend/.env`
   - Frontend: Create `frontend/.env.local`

4. **Start services:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000/api

---

## 📖 Project Structure

```
sentrypulse/
├── backend/          # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Data models
│   │   ├── repositories/ # Data access layer
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── middleware/   # Express middleware
│   ├── database/
│   │   └── schema.sql    # Database schema
│   └── server.js         # Entry point
├── frontend/         # Next.js React frontend
│   ├── app/          # Next.js app directory
│   └── lib/          # Utilities
└── tracking/         # Analytics tracking scripts
```

---

## 🎯 Quick Reference

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Test Backend Health
```bash
curl https://your-backend.onrender.com/health
```

### View Render Logs
Render Dashboard → Your Service → Logs tab

### View Supabase Logs
Supabase Dashboard → Logs

### Restart Render Service
Render Dashboard → Your Service → Manual Deploy → Clear build cache & deploy

---

## 📝 Default Credentials

After running migrations and seeding (if you add seed data):
- **Email**: `admin@sentrypulse.com`
- **Password**: `password`

⚠️ **Change these immediately after first login!**

---

## 🆘 Support

- **Documentation**: Check `/docs` folder
- **Issues**: Create an issue in the repository
- **Deployment Help**: Review troubleshooting section above

---

## 📄 License

Proprietary - SootheTech © 2025

---

## 🎉 You're Done!

Your SentryPulse app should now be live:
- **Frontend**: `https://your-app.vercel.app` or `https://your-app.netlify.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: Supabase PostgreSQL

Start monitoring your websites! 🚀
