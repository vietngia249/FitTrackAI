---
document: KNOWN_ISSUES
version: 1.1.0
status: active

created_at: 2026-09-16T07:18:00+07:00
updated_at: 2026-09-16T07:50:00+07:00
last_verified_at: 2026-09-16T07:50:00+07:00

source_snapshot: 2026-09-16
source_commit: d051dae
source_state: clean

verification_status: verified
---

# FitTrack AI - Known Issues & Operational Nuances

## 1. Active Issues & Limitations

### ISSUE-001: Remote Neon Cloud PostgreSQL Connectivity in Offline / Restricted Environments
- **Status**: **RESOLVED** (v1.1.0)
- **Description**: Standard Prisma Rust engine attempts direct TCP handshakes over port 5432 which were blocked or reset (`ECONNRESET`) on restricted networks or Windows machines.
- **Resolution**:
  - Implemented `@prisma/adapter-neon` and `@neondatabase/serverless` with WebSockets (`ws`) in `src/infrastructure/database/prisma.ts`. All queries to Neon now route securely over HTTPS/WSS (port 443).
  - Fastify's global error handler now catches `PrismaClientInitializationError` and returns `503 Service Unavailable` with friendly messaging instead of an opaque 500 error.
  - Developers working strictly offline can still toggle to local Docker PostgreSQL (`npm run db:up`).

---

### ISSUE-002: Copilot Rate Limit Test Duration under Remote DB Timeouts
- **Severity**: Low
- **Description**: The unit test `copilot.test.ts` executes a 15-iteration loop to verify daily rate limiting. When the database is unreachable, each iteration incurs a connection timeout, extending total test execution time.
- **Workaround / Fix**: Use local Postgres or mock the database layer during test executions.

---

### ISSUE-003: Mobile Browser Camera Access Permissions on HTTP Origins
- **Severity**: Medium
- **Description**: Modern mobile browsers (iOS Safari, Android Chrome) strictly prohibit `navigator.mediaDevices.getUserMedia` when loaded over plain HTTP (except for `localhost`).
- **Resolution**:
  - All staging and production deployments must run behind an SSL/TLS terminated reverse proxy (e.g., Cloudflare, Nginx with Let's Encrypt).
  - For local device testing on a local LAN, generate local certificates using `mkcert` or an HTTPS tunneling utility.

---

### ISSUE-004: Offline Workout Session Sync Queue
- **Severity**: Low (Feature in Progress)
- **Description**: Active sessions and newly created routines currently persist to browser `localStorage` (`fittrack_workout_plans`, `fittrack_active_session`). Automatic background reconciliation to the backend when reconnecting is currently handled manually upon session completion.
- **Planned Resolution**: Provision automated background service worker sync in the `worker/` service.

---

## Changelog
 
| Version | Date | Changes |
|---|---|---|
| 1.1.0 | 2026-09-16 | Mark ISSUE-001 resolved with `@prisma/adapter-neon` serverless driver integration and 503 fallback |
| 1.0.0 | 2026-09-16 | Initial cataloging of known issues, air-gapped database behaviors, and mobile camera constraints |
