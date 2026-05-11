# AP Analytics

**AI-Powered Business Viability Intelligence for MSMEs**

AP Analytics helps entrepreneurs evaluate a business location using real-time competitor data and a local ML model (BVI — Business Viability Index).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js 20 + Express + TypeScript |
| Database | PostgreSQL 16 + PostGIS 3.4 |
| ORM | Prisma |
| ML | scikit-learn / XGBoost model (Python 3, subprocess bridge) |
| Maps | Google Maps JS API + Google Places API |
| Auth | JWT (bcryptjs, 7-day expiry) |

---

## Setup Guide

Read the label on each step before running it.

---

### STEP 1 — Install system dependencies
**Do this: once per machine, skip if already done**

You need these installed on your machine before anything else:

- **Node.js 20+** — check with `node --version`
- **Python 3.9+** — check with `python3 --version`
- **Docker Desktop** — download from [docker.com](https://docker.com/products/docker-desktop)

---

### STEP 2 — Clone the repo and install packages
**Do this: once per clone**

```bash
git clone <repo-url>
cd apanalytics
npm run install:all
```

`install:all` installs packages for the root, `backend/`, and `frontend/` in one command.

---

### STEP 3 — Install Python ML dependencies
**Do this: once per machine, skip if already done**

```bash
pip3 install scikit-learn numpy pandas scipy xgboost geopandas shapely
```

To check if they're already installed:
```bash
python3 -c "import sklearn, numpy, pandas, scipy, xgboost, geopandas, shapely; print('all good')"
```

If it prints `all good`, skip this step.

> **Note:** `geopandas` and `shapely` are required for the RTRW zone classification feature. If you only see warnings about zone data not loading, these packages may not be installed.

---

### STEP 3b — Fetch Jakarta RTRW zoning data
**Do this: once per clone, or when you want fresh zoning data**

AP Analytics classifies business locations against Jakarta's official RTRW (Rencana Tata Ruang Wilayah) zoning plan to warn users about restricted zones (Jalur Hijau / RTH).

```bash
cd apanalytics
python3 backend/scripts/fetch_rtrw.py
```

This fetches polygon data from GISTARU ATR/BPN (with OSM Overpass as fallback) and saves it to `backend/data/jakarta_rtrw.geojson`. The file is git-ignored because it can be large.

If the script fails, the app still works — zone classification will return `UNKNOWN` with a graceful fallback message.

---

### STEP 4 — Get a Google Maps API key
**Do this: once per developer account, skip if you already have a key**

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Create a project if you don't have one
3. Enable these three APIs:
   - **Maps JavaScript API**
   - **Places API (New)**
   - **Geocoding API**
4. Click **Create Credentials → API Key** and copy it

Keep the key ready — the setup script will ask for it the first time you start the app.

> **Billing required.** Google Maps APIs require a billing-enabled project. New accounts get a free monthly credit that covers normal development usage.

---

### STEP 5 — Start Docker Desktop
**Do this: every time before starting the app, skip if Docker is already running**

Open **Docker Desktop** from your Applications folder. Wait until the whale icon in the menu bar stops animating (~30 seconds).

To check if it's already running:
```bash
docker info > /dev/null 2>&1 && echo "Docker is running" || echo "Docker is NOT running"
```

---

### STEP 6 — Start the database
**Do this: every time before starting the app, skip if the container is already healthy**

```bash
cd apanalytics
docker compose up postgres -d
```

Check that it started correctly:
```bash
docker compose ps
```

The `STATUS` column for `ap_analytics_db` must say **healthy**. If it says `starting`, wait 15 seconds and check again.

> **Port note:** The database runs on host port **5433** (not 5432). This is already configured correctly in the `.env` files.

---

### STEP 7 — Run the database migration
**Do this: once after first clone, and again only if `prisma/schema.prisma` changes**

```bash
cd apanalytics/backend
npx prisma migrate dev --name init
cd ..
```

To check if the migration has already been run:
```bash
cd apanalytics/backend
npx prisma migrate status
```

If it says `Database schema is up to date`, skip this step.

---

### STEP 8 — Fix script permissions (macOS only)
**Do this: once after first `npm run install:all`, skip if already done**

```bash
cd apanalytics/backend
chmod +x node_modules/.bin/tsx node_modules/.bin/prisma
cd ../frontend
chmod +x node_modules/.bin/vite
cd ..
```

You only need to do this once. If you get `Permission denied` errors later, re-run it.

---

### STEP 9 — Start the app
**Do this: every time you want to run the app**

```bash
cd apanalytics
npm run dev
```

**What happens automatically:**

- If a Docker backend container is occupying port 4000, the setup script stops it for you
- If your API keys are missing or not yet configured, you will be prompted:

```
┌──────────────────────────────────────────────┐
│        AP Analytics — Environment Setup       │
└──────────────────────────────────────────────┘
  [1/1] Google Maps API Key
        Paste key and press Enter: _
```

Paste your key and press Enter. `JWT_SECRET` is generated automatically — no input needed.

- On every subsequent run, setup is skipped and both servers start immediately

Once running:
- Frontend → **http://localhost:5173** (or 5174 if 5173 is taken)
- Backend API → **http://localhost:4000**

---

## Quick Reference

### Starting from scratch (first time on this machine)

Run all steps: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

### Returning to the project (already set up)

Run only: **5 → 6 → 9**

i.e.:
```bash
# Open Docker Desktop, wait for it to start, then:
docker compose up postgres -d
npm run dev
```

### After pulling new code from git

```bash
npm run install:all          # if package.json changed
cd backend && npx prisma migrate dev --name update && cd ..   # if schema.prisma changed
npm run dev
```

---

## Troubleshooting

**`Cannot connect to the Docker daemon`**
Docker Desktop is not open. Open it from Applications and wait for the whale icon to stop animating.

**`docker compose: no configuration file provided`**
You are in the wrong folder. Run `cd apanalytics` first — `docker-compose.yml` lives inside `apanalytics/`, not the repo root.

**`P1000: Authentication failed` (database)**
The `DATABASE_URL` is wrong. It must be:
```
postgresql://postgres:password@localhost:5433/ap_analytics?schema=public
```
Note: password is `password`, database name is `ap_analytics`, port is `5433`.

**`Permission denied` on tsx / vite / prisma**
Run the chmod commands from Step 8.

**Port 4000 already in use (Docker backend conflict)**
`npm run dev` handles this automatically. If you are running the servers manually, stop the Docker backend first:
```bash
docker stop ap_analytics_backend
```

**`No module named 'xgboost'` in backend logs**
Run Step 3. If `pip3 install` seems to succeed but the error persists, make sure you are using the same Python that the backend spawns:
```bash
which python3
/Library/Frameworks/Python.framework/Versions/3.11/bin/pip3 install xgboost
```

**Maps show "API key not configured"**
- Confirm `frontend/.env` has `VITE_GOOGLE_MAPS_API_KEY` set to a real key (not the placeholder)
- Restart Vite after changing `.env` — Vite does not hot-reload env changes

**Analysis fails silently**
- Check that the backend terminal (cyan output) is not showing Python errors
- Make sure Step 3 (Python packages) was done
- Run `docker compose ps` — only `ap_analytics_db` should be running, not `ap_analytics_backend`

**`Loader must not be called again with different options` (Google Maps)**
This is a known issue when both MapPicker and CompetitorMap are on the same page. It is already fixed in the current codebase via a shared loader singleton in `src/lib/googleMapsLoader.ts`. If you see it, make sure you have the latest code.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Value for local dev |
|----------|----------|---------------------|
| `DATABASE_URL` | Yes | `postgresql://postgres:password@localhost:5433/ap_analytics?schema=public` |
| `JWT_SECRET` | Yes | Auto-generated by `npm run dev` |
| `GOOGLE_MAPS_API_KEY` | Yes | Your API key — set by `npm run dev` on first run |
| `FRONTEND_URL` | No | Defaults to `http://localhost:5173` |
| `PORT` | No | Defaults to `4000` |

### Frontend (`frontend/.env`)

| Variable | Required | Value for local dev |
|----------|----------|---------------------|
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Your API key — set by `npm run dev` on first run |
| `VITE_API_URL` | No | Leave blank — Vite proxies `/api` to `localhost:4000` automatically |

---

## Full Docker Deployment

To run everything inside Docker (database + backend + frontend):

```bash
cd apanalytics
cp .env.example .env
# Open .env and fill in JWT_SECRET, GOOGLE_MAPS_API_KEY, VITE_GOOGLE_MAPS_API_KEY
docker compose up --build
```

- Frontend → `http://localhost:5173`
- Backend → `http://localhost:4000`

> Do **not** run `npm run dev` while the full Docker stack is up — they compete for the same ports.

---

## Project Structure

```
apanalytics/
├── setup.mjs                 # Interactive setup script (runs before dev servers)
├── .env.example              # Root env template (for docker-compose)
├── docker-compose.yml
├── backend/
│   ├── .env.example
│   ├── data/jakarta_rwi.csv  # Relative Wealth Index data for Jakarta
│   ├── business_viability_model.pkl
│   ├── prisma/schema.prisma
│   └── src/
│       ├── controllers/      # Auth, business, analyze
│       ├── lib/              # Prisma client, Google Places, ML predictor bridge
│       ├── middleware/       # JWT auth, express-validator
│       └── routes/
└── frontend/
    └── src/
        ├── components/       # Navbar, ScoreDisplay, SwotCard, maps, etc.
        ├── contexts/         # AuthContext, WizardContext
        ├── lib/              # Axios API client, shared Google Maps loader, utils
        ├── pages/            # All pages + wizard steps
        └── types/            # Shared TypeScript types
```

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, get JWT |
| GET | `/api/auth/me` | JWT | Validate token / get current user |
| GET | `/api/business` | JWT | List all profiles |
| POST | `/api/business` | JWT | Create business profile |
| GET | `/api/business/:id` | JWT | Get single profile |
| DELETE | `/api/business/:id` | JWT | Delete profile |
| POST | `/api/analyze/:profileId` | JWT | Run BVI analysis |
| GET | `/api/zone?lat=X&lng=Y` | — | RTRW zone classification |
| GET | `/api/health` | — | Health check |
