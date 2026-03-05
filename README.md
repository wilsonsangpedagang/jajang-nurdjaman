# AP Analytics

**AI-Powered Business Location Intelligence for MSMEs**

AP Analytics is a full-stack decision-support platform that acts as an automated business surveyor. It helps entrepreneurs evaluate the viability of a new business location using spatial data, real-time competitor analysis, and AI-generated strategic insights.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + PostGIS |
| ORM | Prisma |
| AI | Google Gemini 1.5 Flash |
| Maps | Google Maps JS API + Google Places API |
| Auth | JWT (bcrypt password hashing) |

---

## Features

- **Secure Authentication** — Email/password signup with JWT sessions
- **Multi-Step Survey Wizard** — Guided 5-step business profiling
- **Interactive Map** — Pin-drop location selector with dynamic radius circle
- **Competitor Intelligence** — Real-time Google Places data for nearby competitors
- **AI SWOT Analysis** — Gemini-generated Strengths, Weaknesses, Opportunities, Threats
- **Predictive Success Score** — Radar chart with 4-dimension breakdown
- **Strategic Roadmap** — AI tips for differentiation, pricing, and marketing
- **Analysis History** — Dashboard to manage and review past surveys

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Google Maps API Key (with Places API enabled)
- Google Gemini API Key

### 1. Clone & Install

```bash
cd ap-analytics
cp .env.example .env
# Edit .env with your API keys

npm run install:all
```

### 2. Start Database

```bash
docker-compose up postgres -d
```

### 3. Run Migrations

```bash
cd backend
cp .env.example .env
# Edit .env with your keys
npx prisma migrate dev --name init
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend (port 4000)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
cd frontend
cp .env.example .env
# Set VITE_GOOGLE_MAPS_API_KEY
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173)

### Full Docker Deployment

```bash
cp .env.example .env
# Fill in all API keys

docker-compose up --build
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |
| `GOOGLE_MAPS_API_KEY` | Google Maps + Places API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `FRONTEND_URL` | Frontend origin for CORS |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JS API key |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/business` | List user's profiles |
| POST | `/api/business` | Create business profile |
| GET | `/api/business/:id` | Get single profile |
| DELETE | `/api/business/:id` | Delete profile |
| POST | `/api/analyze/:profileId` | Run AI analysis |

---

## Database Schema

```
users
  id, email, passwordHash, name, createdAt, updatedAt

business_profiles
  id, userId, name, category, concept
  products (JSON), goals (String[])
  latitude, longitude, radiusMeters
  analysisResult (JSON), status
  createdAt, updatedAt
```

---

## Project Structure

```
ap-analytics/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── lib/             # Gemini + Places + Prisma
│   │   ├── middleware/      # Auth + validation
│   │   └── routes/          # Express routers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # Auth + Wizard state
│   │   ├── pages/           # Route pages + wizard steps
│   │   ├── lib/             # API client + utils
│   │   └── types/           # TypeScript types
│   └── package.json
├── docker-compose.yml
└── README.md
```
