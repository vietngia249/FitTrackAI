# FitTrack AI 🏋️‍♂️🤖

> Full-stack personal fitness management & AI coaching platform combining workout tracking, nutrition management, progress analytics, and browser-based AI exercise form analysis.

---

## 🌟 Features Overview

- **Workout Tracking:** Flexible workout plans (PPL, Upper/Lower, Custom), live workout session mode with set-by-set logging (reps, weight, RPE, rest timer), previous performance quick copy, and offline sync.
- **Analytics & Progression:** Volume calculation (sets × reps × weight), Epley estimated 1RM, automatic PR detection across 4 categories, and interactive trend charts.
- **Nutrition Management:** Food diary, local-first search with Open Food Facts fallback, macro snapshotting at log time, and daily calorie/macro goals.
- **Progress Tracking:** Weight tracking with 7-day moving average trend lines, comprehensive body measurements, and private progress photo vault.
- **AI Exercise Form Analysis:** Real-time, client-side computer vision powered by MediaPipe Pose (33 landmarks), joint-angle 3-point geometry, rep counting state machines, and dimensional scoring for Bicep Curl, Squat, and Push-up.
- **AI Fitness Copilot:** Retrieval-grounded coaching assistant constrained to user-logged data with hard anti-hallucination guardrails and daily call budgets.
- **Internationalization:** Full bilingual support for English (`en`) and Vietnamese (`vi`).

---

## 🏗️ Architecture & Tech Stack

```
                         React Web / PWA (Vite + TS + Tailwind)
                                       │
                                REST / WebSocket
                                       │
                               Fastify API (Node.js + TS)
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ↓                              ↓                              ↓
  PostgreSQL 16                  Redis 7 (BullMQ)               Cloudflare R2
  (Prisma ORM)                   (Background Jobs)              (Private Media)
```

| Layer                          | Technology                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Frontend**             | React 18/19, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router, Recharts,`react-i18next` |
| **Backend**              | Node.js, Fastify, TypeScript, Zod, Pino Logger, Argon2, JWT                                         |
| **Database & ORM**       | PostgreSQL 16, Prisma ORM                                                                           |
| **AI / Computer Vision** | MediaPipe Pose, WebGL, Canvas API,`requestAnimationFrame`                                         |
| **Queue / Worker**       | Redis 7, BullMQ                                                                                     |
| **DevOps & Infra**       | Docker, Docker Compose, GitHub Actions                                                              |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x or v22.x / v24.x
- **npm**: v10+
- **Docker & Docker Compose**

### 1. Clone & Setup Environment

```bash
# Clone the repository
git clone https://github.com/your-repo/fittrack-ai.git
cd fittrack-ai

# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2. Start Services (PostgreSQL & Redis)

```bash
docker compose up -d
```

### 3. Install Dependencies & Setup Prisma

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init

# Frontend
cd ../frontend
npm install

# Worker
cd ../worker
npm install
```

### 4. Run Development Servers

From the root directory:

```bash
# Run backend (http://localhost:5000)
npm run dev:backend

# Run frontend (http://localhost:5173)
npm run dev:frontend
```

---

## 🧪 Verification & Testing

- Backend Healthcheck: `GET http://localhost:5000/health`
- Frontend UI: Navigate to `http://localhost:5173`
- Type checking: `npm run typecheck`
- Building: `npm run build`

---

## 📄 License

MIT License.
