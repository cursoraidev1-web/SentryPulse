# Quick Deployment Checklist

Fast reference guide for deploying SentryPulse to Vercel/Netlify + Supabase + Render.

## 🚀 Quick Steps

### 1. Supabase Setup (5 min)
- [ ] Create project at [supabase.com](https://supabase.com)
- [ ] Copy connection string from Settings → Database
- [ ] Run `backend/database/schema.sql` in SQL Editor
- [ ] (Optional) Create storage buckets: `avatars`, `logos`

### 2. Render Backend (10 min)
- [ ] Connect GitHub repo to Render
- [ ] Create Web Service:
  - **Root Directory**: `backend`
  - **Build**: `npm install`
  - **Start**: `npm start`
- [ ] Add Environment Variables:
  ```
  NODE_ENV=production
  PORT=10000
  DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
  JWT_SECRET=<generate-strong-secret>
  FRONTEND_URL=https://your-app.vercel.app
  ```
- [ ] Deploy

### 3. Vercel Frontend (5 min)
- [ ] Connect GitHub repo to Vercel
- [ ] Configure:
  - **Root Directory**: `frontend`
  - **Framework**: Next.js
- [ ] Add Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
  NEXT_PUBLIC_TRACKING_URL=https://your-backend.onrender.com/tracker.js
  ```
- [ ] Deploy

### 3b. Netlify Frontend (Alternative)
- [ ] Connect GitHub repo to Netlify
- [ ] Configure:
  - **Base directory**: `frontend`
  - **Build command**: `npm run build`
  - **Publish directory**: `.next`
- [ ] Add same environment variables as Vercel
- [ ] Deploy

## ✅ Verification

```bash
# Test backend
curl https://your-backend.onrender.com/health

# Test frontend
# Visit your Vercel/Netlify URL
```

## 🔑 Generate JWT Secret

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 📝 Environment Variables Cheat Sheet

### Render (Backend)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
JWT_SECRET=<your-generated-secret>
FRONTEND_URL=https://your-app.vercel.app
```

### Vercel/Netlify (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_TRACKING_URL=https://your-backend.onrender.com/tracker.js
```

## 🐛 Common Issues

**Backend won't start?**
- Check Render logs
- Verify DATABASE_URL format
- Ensure PORT is set (Render uses PORT env var)

**Frontend can't connect?**
- Verify NEXT_PUBLIC_API_URL matches backend URL
- Check CORS settings
- Look at browser console errors

**Database errors?**
- Verify Supabase connection string
- Check if schema.sql was run
- Review Supabase logs

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)



