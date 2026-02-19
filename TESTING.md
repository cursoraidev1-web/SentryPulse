# SentryPulse – Testing Guide

How to test all features: automated API tests and manual UI checklist.

---

## 1. Automated API tests (backend)

**Prerequisites:** Database migrated and seeded (`npm run migrate`, `npm run seed`). Backend **not** running (tests use the app in-process).

```bash
cd backend
npm test
```

**What is tested:**

| Area        | Tests |
|------------|--------|
| System     | `GET /api/health` → 200, `status: ok` |
| Auth       | Login (valid/invalid), `GET /api/auth/me` with/without token |
| Teams      | `GET /api/teams` returns list |
| Monitors   | `GET /api/monitors?team_id=` returns list |
| Incidents  | `GET /api/incidents?team_id=` returns list |
| Analytics  | `GET /api/analytics/sites?team_id=` returns list |
| Status     | `GET /api/status-pages?team_id=`, `GET /api/status/public-status` (public) |
| 404        | Unknown route returns 404 |

**Watch mode:** `npm run test:watch`

---

## 2. Manual test checklist (full app)

Run backend and frontend, then go through this list in the browser.

**Start servers:**

```bash
# Terminal 1 – backend
cd backend && npm run dev

# Terminal 2 – frontend
cd frontend && npm run dev
```

Open **http://localhost:3000**. Login: **admin@sentrypulse.com** / **password**.

---

### Quick test: Website monitoring

1. **Create a monitor**
   - Go to **Monitors** → **Add monitor** (or open **http://localhost:3000/monitors/new**).
   - **Name:** e.g. `Example.com`
   - **Target URL:** `example.com` (or any site you want to monitor).
   - Leave **HTTPS**, **GET**, interval **60** seconds, **Check SSL** on.
   - Click **Create Monitor**.

2. **See it run**
   - You’re redirected to the monitors list. Your monitor appears (status may be **up**, **down**, or **pending**).
   - **Backend scheduler** runs checks every **10 seconds** for any monitor that is due (based on its interval). So within about 10–60 seconds the first check runs and the list updates.
   - Click the monitor row to open its **detail page**.

3. **Trigger a check immediately**
   - On the monitor detail page, click **Check now** (top right of “Recent Activity”).
   - A check runs right away; the result appears in **Recent Activity** (response time, HTTP status, success/failure).
   - The page auto-refreshes every 5 seconds, or refresh once after “Check completed” toast.

4. **What you see**
   - **Up** (green): Site responded with the expected status code (default 200).
   - **Down** (red): Timeout, wrong status code, or (if you set one) missing keyword / SSL issue.
   - **Recent Activity**: List of checks with time, response (ms), and HTTP status.

5. **Optional**
   - Create another monitor for a URL that will fail (e.g. `https://nonexistent-domain-12345.com`) to see a **down** state and error message.
   - On **Create Monitor**, set **Keyword Check** to a string that doesn’t exist on the page to see a keyword failure.

---

### Auth

- [ ] **Login** – Wrong password shows error; correct credentials redirect to dashboard.
- [ ] **Logout** – Logout clears session and redirects to login.
- [ ] **Protected routes** – Visiting `/dashboard` (or any protected page) when logged out redirects to login.

---

### Dashboard

- [ ] **Load** – Dashboard loads without error.
- [ ] **Teams** – At least one team is shown (or “No teams” if none).
- [ ] **Monitors** – Monitors for selected team appear (or empty state).
- [ ] **Incidents** – Incidents for selected team appear (or empty state).
- [ ] **Refresh** – Refresh button updates data.

---

### Teams

- [ ] **List** – Team list loads.
- [ ] **Create team** – New team appears in the list.
- [ ] **Team details** – Can open a team and see name/settings.
- [ ] **Invite member** – Invite form accepts email and sends (or shows expected error if no mail configured).
- [ ] **Remove member** – Remove member works (if you have another member).

---

### Monitors

- [ ] **List** – Monitors for the team load.
- [ ] **Create monitor** – Add URL (e.g. `https://example.com`), save; new monitor appears.
- [ ] **Edit monitor** – Change name/URL and save; changes persist.
- [ ] **Run check** – Manual “Check now” runs and status/response time update (or show loading/result).
- [ ] **Checks history** – Check history or last check time is visible.
- [ ] **Delete monitor** – Delete works and monitor disappears from list.

---

### Incidents

- [ ] **List** – Incidents load; filters (All / Investigating / Resolved, etc.) work.
- [ ] **Create incident** – Create with title, description, monitor; it appears in the list.
- [ ] **View incident** – Can open one incident and see details.
- [ ] **Update incident** – Edit title/description/status and save.
- [ ] **Resolve incident** – Resolve action marks it resolved and shows resolved time.

---

### Status pages

- [ ] **List** – Status pages for the team load.
- [ ] **Create status page** – Create with name; it appears in the list.
- [ ] **Edit/delete** – Edit name/settings and delete work.
- [ ] **Add/remove monitor** – Add a monitor to the status page; remove it; list updates.
- [ ] **Public page** – Open the public URL (e.g. `http://localhost:3000/status/public-status`) in an incognito window; page loads and shows monitors (or “No services”).

---

### Analytics

- [ ] **Sites list** – Analytics sites for the team load.
- [ ] **Create site** – Add site (name + domain); it appears in the list.
- [ ] **Site detail** – Open a site; stats (visitors, pageviews, etc.) and chart load (or show zeros/empty).
- [ ] **Embed snippet** – Copy snippet shows `loader.js` and `data-tracking-code` (and optional `data-endpoint`); no `script.js` or `data-website-id`.
- [ ] **Update/delete site** – Edit name/domain and delete site; list updates.

---

### Billing (static)

- [ ] **Page loads** – Billing/plans page loads without error.
- [ ] **Plans** – Free / Pro / Business (or your plan names) are visible.

---

### Quick smoke (API only)

With backend running, you can smoke-test from the command line:

```bash
# Health
curl -s http://localhost:8000/api/health

# Login and get token (Windows PowerShell – adjust for your shell)
$r = Invoke-RestMethod -Uri http://localhost:8000/api/auth/login -Method POST -Body '{"email":"admin@sentrypulse.com","password":"password"}' -ContentType "application/json"
$r.data.token

# Then use the token for e.g. teams (replace YOUR_TOKEN)
curl -s -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:8000/api/teams"
```

---

## 3. After code changes

1. **Backend:** Run `npm test` in `backend` after changing API or repos.
2. **Full flow:** Run through the manual checklist for the areas you changed.
3. **DB reset (optional):** To test from a clean state:
   - Drop/recreate DB or run migrations down if you have them.
   - `npm run migrate` then `npm run seed` in `backend`.
   - Run API tests and manual tests again.

This keeps API behavior and main user flows verified.
