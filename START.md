# Start SentryPulse

Follow these steps to run the app locally (Windows with WAMP).

## Prerequisites

- **WAMP** running with **MySQL** (green icon).
- **Node.js** (LTS) installed.
- Database `sentrypulse` created in phpMyAdmin (see [SETUP_WITH_WAMP.md](SETUP_WITH_WAMP.md)).

## One-time setup

### 1. Backend env and DB

```powershell
cd C:\vm\SentryPulse\backend
copy .env.example .env
```

Edit `backend\.env`: set `DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=` (or your WAMP MySQL user/password), `DB_NAME=sentrypulse`.

### 2. Run migrations and seed

```powershell
cd C:\vm\SentryPulse\backend
npm install
npm run migrate
npm run seed
```

### 3. Frontend env

```powershell
cd C:\vm\SentryPulse\frontend
copy .env.example .env.local
npm install
```

Keep `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `frontend\.env.local`.

### 4. Root (optional, to run both from repo root)

```powershell
cd C:\vm\SentryPulse
npm install
```

---

## Start the app

**Option A – One command from root (runs backend + frontend together):**

```powershell
cd C:\vm\SentryPulse
npm run dev
```

**Option B – Two terminals (recommended if one fails):**

**Terminal 1 – Backend (API on port 8000):**

```powershell
cd C:\vm\SentryPulse\backend
npm run dev
```

**Terminal 2 – Frontend (app on port 3000):**

```powershell
cd C:\vm\SentryPulse\frontend
npm run dev
```

---

## Open the app

- **App:** http://localhost:3000  
- **API health:** http://localhost:8000/api/health  

**Login:** `admin@sentrypulse.com` / `password` (after running `npm run seed` in backend).

---

## If something fails

| Problem | Fix |
|--------|-----|
| **Port 8000 already in use** | Stop the other backend (close the terminal that ran `npm run dev` in `backend`, or run `Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess \| Stop-Process -Force` in PowerShell). |
| **Port 3000 already in use** | Use another terminal or stop the process using port 3000. |
| **Database connection error** | Check WAMP MySQL is running, and `backend\.env` has correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. |
| **Frontend shows SSL error in terminal** | If you see “✓ Ready” as well, the app is running. Open http://localhost:3000 in the browser. See [SETUP_WITH_WAMP.md](SETUP_WITH_WAMP.md#troubleshooting). |

For full WAMP setup (database creation, PHP/Node), see **[SETUP_WITH_WAMP.md](SETUP_WITH_WAMP.md)**.
