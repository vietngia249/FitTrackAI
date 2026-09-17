---
document: DEPLOYMENT
version: 1.0.0
status: active

created_at: 2026-09-16T07:18:00+07:00
updated_at: 2026-09-16T07:18:00+07:00
last_verified_at: 2026-09-16T07:18:00+07:00

source_snapshot: 2026-09-16
source_commit: d051dae
source_state: clean

verification_status: verified
---

# FitTrack AI - Deployment & Operations Guide

## 1. System Requirements & Runtime

- **Node.js**: `v20.x` LTS or higher.
- **Package Manager**: `npm` v10+.
- **Database**: PostgreSQL 16+ (Docker, Neon, AWS RDS, Supabase).
- **In-Memory Store**: Redis 7+ (Docker, Upstash, AWS ElastiCache).
- **HTTPS Requirement**: Client-side MediaPipe Pose requires `navigator.mediaDevices.getUserMedia`, which browsers strictly disable on insecure HTTP origins (except `localhost`). Production deployments MUST terminate TLS/HTTPS.

---

## 2. Docker & Container Services

Local development and containerized deployments use `docker-compose.yml`:

```bash
# Spin up PostgreSQL 16 and Redis 7 in the background
npm run db:up

# Inspect running container logs
docker compose logs -f

# Shut down containers while preserving volumes
npm run db:down
```

### Docker Compose Service Definitions
- **PostgreSQL**: `postgres:16-alpine` on port `5432` with healthcheck using `pg_isready`.
- **Redis**: `redis:7-alpine` on port `6379` with healthcheck using `redis-cli ping`.

---

## 3. Environment Variable Checklist

### Backend Configuration (`backend/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No (Default: 5000) | Fastify HTTP port | `5000` |
| `HOST` | No (Default: 0.0.0.0) | Fastify bind host | `0.0.0.0` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/fittrack_db` |
| `JWT_SECRET` | Yes | Cryptographic secret for access token signing | `min-32-char-random-secret-key` |
| `JWT_EXPIRES_IN` | No (Default: 15m) | Access token lifespan | `15m` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | No (Default: 30) | Refresh token lifespan | `30` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI Copilot | `AIzaSy...` |
| `LLM_MODEL` | No (Default: gemini-flash-lite-latest) | Default LLM model identifier | `gemini-flash-lite-latest` |
| `GOOGLE_CLIENT_ID` | Optional | Google GIS Client ID for Google Sign-In | `1234...apps.googleusercontent.com` |
| `CORS_ORIGIN` | No (Default: true) | Allowed CORS origins | `https://fittrack.yourdomain.com` |

---

## 4. Build & Production Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations & seed exercises
npm run prisma:migrate
npm --prefix backend run prisma:seed

# 3. Compile production bundles
npm run build

# 4. Start production backend server
npm --prefix backend run start

# 5. Serve frontend static assets from frontend/dist/ via Nginx / Caddy / Cloudflare Pages
```

---

## 5. Production Health Probes

Load balancers, Kubernetes, or Docker orchestration can monitor system status:
- **Liveness Probe**: `GET /api/v1/health`
  - Returns: `200 OK` `{ "status": "ok", "uptime": 3412.5 }`
- **Readiness Probe**: `GET /api/v1/health/ready`
  - Returns: `200 OK` if database connection succeeds; `503 Service Unavailable` if database is down.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-09-16 | Initial baseline deployment guide, container configuration, and environment specifications |
