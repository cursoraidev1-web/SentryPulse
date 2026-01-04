# Deployment Configuration Changes

This document summarizes the changes made to prepare SentryPulse for deployment to Vercel/Netlify (frontend), Supabase (database), and Render (backend).

## ✅ Changes Made

### 1. Database Connection (`backend/src/Core/database.js`)
- **Added support for Supabase connection strings**
- Now supports both:
  - `DATABASE_URL` connection string (Supabase format)
  - Individual `DB_HOST`, `DB_PORT`, etc. parameters
- Automatically enables SSL for Supabase connections

### 2. CORS Configuration (`backend/server.js`)
- **Updated to support multiple frontend origins**
- Supports both Vercel and Netlify URLs
- Can be configured via `FRONTEND_URL` or `FRONTEND_URLS` (comma-separated)
- Still allows localhost for development

### 3. Deployment Configuration Files Created

#### Backend
- `backend/render.yaml` - Render deployment configuration
- `backend/.env.example` - Updated with Supabase connection string format

#### Frontend
- `frontend/netlify.toml` - Netlify deployment configuration
- `frontend/vercel.json` - Vercel deployment configuration

#### Documentation
- `DEPLOYMENT.md` - Complete deployment guide
- `QUICK_DEPLOY.md` - Quick reference checklist

## 📋 What You Need to Do

### 1. Set Up Supabase
1. Create a Supabase project
2. Run `backend/database/schema.sql` in Supabase SQL Editor
3. Copy your connection string

### 2. Deploy Backend to Render
1. Connect your GitHub repo
2. Set environment variables (see DEPLOYMENT.md)
3. Deploy

### 3. Deploy Frontend to Vercel/Netlify
1. Connect your GitHub repo
2. Set environment variables
3. Deploy

## 🔧 Environment Variables Needed

### Backend (Render)
```env
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
# OR use individual parameters:
# DB_HOST=db.xxx.supabase.co
# DB_PORT=5432
# DB_DATABASE=postgres
# DB_USERNAME=postgres
# DB_PASSWORD=xxx

JWT_SECRET=<generate-strong-secret>
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=10000
```

### Frontend (Vercel/Netlify)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_TRACKING_URL=https://your-backend.onrender.com/tracker.js
```

## 🎯 Next Steps

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. Or use [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for a fast checklist
3. Deploy and test!

## 📝 Notes

- The database connection now automatically detects Supabase and enables SSL
- CORS is configured to allow your frontend domains
- All configuration files are ready for deployment
- No code changes needed - just set environment variables and deploy!



