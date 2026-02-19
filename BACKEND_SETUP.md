# SentryPulse Backend Setup (Node.js)

The **backend is Node.js (Express + TypeScript)**, not PHP. Use the steps below to run it.

---

## Option 1: Run everything with Docker (easiest)

You need **Docker** and **Docker Compose** installed. No PHP, no Composer.

### 1. Start all services

From the project root (`SentryPulse/`):

```bash
docker compose up --build -d
```

This starts: **MySQL**, **Redis**, **backend (Node)**, **frontend (Next.js)**, **nginx**, and a **cron** container for monitor checks.

### 2. Wait for MySQL (about 10–15 seconds)

```bash
# Windows PowerShell
Start-Sleep -Seconds 15

# Or on Mac/Linux
sleep 15
```

### 3. Run database migrations and seed (Node.js commands)

```bash
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

### 4. Open the app

- **Dashboard (frontend):** http://localhost:3000  
- **Backend API:** http://localhost:8000/api  
- **Health check:** http://localhost:8000/api/health  

**Default login:** `admin@sentrypulse.com` / `password`

---

## Option 2: Run backend locally (no Docker)

Use this if you want to run the backend on your machine and use a local MySQL + Redis.

### 1. Install

- **Node.js** 18+ (from https://nodejs.org)
- **MySQL 8** (running locally or remote)
- **Redis** (running locally or remote)

### 2. Create the database

In MySQL:

```sql
CREATE DATABASE sentrypulse;
CREATE USER 'sentrypulse'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL ON sentrypulse.* TO 'sentrypulse'@'localhost';
FLUSH PRIVILEGES;
```

(Or use your own database name, user, and password and put them in `.env` below.)

### 3. Backend environment

In the **backend** folder:

```bash
cd backend
cp .env.example .env
```

Edit **`backend/.env`** and set at least:

```env
NODE_ENV=development
PORT=8000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=sentrypulse
DB_USER=sentrypulse
DB_PASSWORD=secret

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-super-secret-jwt-key-change-this
```

Use your real MySQL/Redis host, port, user, and password if different.

### 4. Install dependencies and run migrations

```bash
cd backend
npm install
npm run migrate
npm run seed
```

### 5. Start the backend

```bash
npm run dev
```

Backend will be at **http://localhost:8000**.  
API base: **http://localhost:8000/api**.

### 6. Start the frontend (separate terminal)

```bash
cd frontend
cp .env.example .env.local
```

In **`frontend/.env.local`** set:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=SentryPulse
```

Then:

```bash
npm install
npm run dev
```

Open **http://localhost:3000** to use the app. It will talk to the backend at `http://localhost:8000/api`.

---

## Quick reference

| What              | Command / URL                                      |
|-------------------|----------------------------------------------------|
| Backend (Node)    | `cd backend && npm run dev`                        |
| Frontend (Next.js)| `cd frontend && npm run dev`                       |
| Migrations        | `cd backend && npm run migrate`                   |
| Seed data         | `cd backend && npm run seed`                      |
| With Docker       | `docker compose exec backend npm run migrate`     |
| With Docker       | `docker compose exec backend npm run seed`        |
| Dashboard         | http://localhost:3000                              |
| API               | http://localhost:8000/api                          |
| Health            | http://localhost:8000/api/health                   |

---

## If you thought the backend was PHP

This project was migrated to **Node.js**. Old docs (SETUP.md, QUICKSTART.md) may still mention PHP/Composer/Artisan; ignore those and use the **Node/npm** commands above. The README in the repo root is correct (Node.js + Express + TypeScript).
