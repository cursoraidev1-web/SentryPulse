# Run SentryPulse with WAMP (No Docker)

Use **WAMP’s MySQL** and run the **Node.js backend** and **Next.js frontend** on your PC. No Docker needed.

---

## 1. Create the database in WAMP

1. Start **WAMP** and make sure the **MySQL** service is running (green icon).
2. Open **phpMyAdmin**: http://localhost/phpmyadmin (or click the WAMP tray icon → phpMyAdmin).
3. Create a database and user:

**Option A – Using phpMyAdmin (SQL tab)**

- Go to the **SQL** tab and run:

```sql
CREATE DATABASE IF NOT EXISTS sentrypulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'sentrypulse'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON sentrypulse.* TO 'sentrypulse'@'localhost';
FLUSH PRIVILEGES;
```

**Option B – Using root (simpler)**

- Create only the database:
  - Click **New** (or “New database”).
  - Database name: `sentrypulse`
  - Collation: `utf8mb4_unicode_ci`
  - Create.
- Then use in `.env`:
  - `DB_USER=root`
  - `DB_PASSWORD=` (empty, or whatever your WAMP root password is)

---

## 2. Backend (Node.js)

You need **Node.js** installed: https://nodejs.org (LTS).

### 2.1 Create and edit `.env`

In PowerShell or Command Prompt:

```cmd
cd C:\vm\SentryPulse\backend
copy .env.example .env
```

Edit `backend\.env` in a text editor. Set at least:

```env
NODE_ENV=development
PORT=8000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=sentrypulse
DB_USER=root
DB_PASSWORD=
```

- If you created user `sentrypulse` with password `secret`, use `DB_USER=sentrypulse` and `DB_PASSWORD=secret`.
- WAMP often uses `3306` for MySQL; if yours is different (e.g. 3307), set `DB_PORT` accordingly.

**Redis (optional for basic use):**  
The app starts without Redis. If you don’t have Redis, leave `REDIS_HOST=localhost`; the main API and dashboard will still work. Queue/cache features may need Redis later.

### 2.2 Install, migrate, seed, run

```cmd
cd C:\vm\SentryPulse\backend
npm install
npm run migrate
npm run seed
npm run dev
```

Leave this window open. When you see something like “Server running on port 8000”, the backend is ready.

- **API:** http://localhost:8000/api  
- **Health:** http://localhost:8000/api/health  

---

## 3. Frontend (Next.js)

Open a **second** terminal.

### 3.1 Create and edit `.env.local`

```cmd
cd C:\vm\SentryPulse\frontend
copy .env.example .env.local
```

Edit `frontend\.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=SentryPulse
```

### 3.2 Install and run

```cmd
cd C:\vm\SentryPulse\frontend
npm install
npm run dev
```

When it says “Ready”, open in the browser:

**http://localhost:3000**

**Login:** `admin@sentrypulse.com` / `password`

---

## Troubleshooting

### Port 8000 or 3000 already in use

If the backend says **EADDRINUSE: port 8000** (or frontend port 3000), another process is using that port. Close the other terminal where you started the backend/frontend, or in PowerShell (run as Administrator if needed) to free port 8000:

```powershell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
```

Then start the server again.

### Frontend shows SSL error but “Ready in 6.4s”

If you see an error like `ERR_SSL_SSL/TLS_ALERT_BAD_RECORD_MAC` in the terminal but also **“✓ Ready in 6.4s”**, the app is running. The message comes from Next.js’s dev watcher and is often caused by:

- **Cursor / VS Code port forwarding** – The editor may expose the app over HTTPS. Prefer opening the app in your browser at **http://localhost:3000** (not the forwarded URL).
- **Proxy or antivirus** – TLS inspection can sometimes trigger this. You can ignore the error if the app loads in the browser.

If the frontend fails to start at all, try running it with relaxed TLS only for local dev (do **not** use in production):

```cmd
cd C:\vm\SentryPulse\frontend
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm run dev
```

---

## Quick recap

| Step        | Where              | Command / Action                    |
|------------|--------------------|-------------------------------------|
| Database   | WAMP / phpMyAdmin  | Create DB `sentrypulse` (and user)  |
| Backend    | `C:\vm\SentryPulse\backend`  | `copy .env.example .env` → edit → `npm install` → `npm run migrate` → `npm run seed` → `npm run dev` |
| Frontend   | `C:\vm\SentryPulse\frontend` | `copy .env.example .env.local` → edit → `npm install` → `npm run dev` |
| Open app   | Browser            | http://localhost:3000               |

You can use **only WAMP’s MySQL**; no Docker and no PHP are required for this app (backend is Node.js).
