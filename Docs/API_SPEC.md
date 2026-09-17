---
document: API_SPEC
version: 1.1.0
status: active

created_at: 2026-09-16T07:18:00+07:00
updated_at: 2026-09-16T08:00:00+07:00
last_verified_at: 2026-09-16T08:00:00+07:00

source_snapshot: 2026-09-16
source_commit: d051dae
source_state: clean

verification_status: verified
---

# FitTrack AI - REST API Specification

## 1. Global Conventions & Protocol Standards

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer token via `Authorization: Bearer <access_token>` header.
- **Refresh Strategy**: Handled via secure HTTP-Only cookie or POST payload to `/auth/refresh`.

### Standard Error Schema
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "issues": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

---

## 2. Authentication Module (`/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user with email, password, and display name |
| `POST` | `/auth/login` | Public | Authenticate with email/password; returns JWT + refresh token |
| `POST` | `/auth/google` | Public | Authenticate via Google GIS ID token |
| `POST` | `/auth/refresh` | Public | Exchange refresh token for new 15-minute access token |
| `POST` | `/auth/logout` | Optional | Invalidate current refresh token |
| `GET` | `/auth/me` | Bearer | Fetch current user account details and fitness profile |
| `PUT` | `/auth/profile` | Bearer | Update biometric profile (height, weight, goal, activity level) |

---

## 3. Exercise Library Module (`/exercises`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/exercises` | Optional | List exercises with query filters (`category`, `equipment`, `level`, `search`) |
| `GET` | `/exercises/:id` | Optional | Retrieve single exercise details by UUID or slug |
| `POST` | `/exercises` | Bearer | Create user-custom exercise |
| `PUT` | `/exercises/:id` | Bearer | Update custom exercise (tenant-isolated) |
| `DELETE` | `/exercises/:id` | Bearer | Delete custom exercise (tenant-isolated) |
| `GET` | `/exercises/categories` | Public | List all supported exercise categories and equipment tags |

---

## 4. Workout Management Module (`/workouts`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/workouts/plans` | Bearer | List user's saved workout routines/plans |
| `POST` | `/workouts/plans` | Bearer | Create new workout routine with planned exercises and sets |
| `GET` | `/workouts/plans/:id` | Bearer | Get specific workout plan |
| `PUT` | `/workouts/plans/:id` | Bearer | Update workout routine |
| `DELETE` | `/workouts/plans/:id` | Bearer | Delete workout routine |
| `POST` | `/workouts/sessions/start` | Bearer | Start active workout session (from plan or quick workout) |
| `GET` | `/workouts/sessions/active` | Bearer | Get currently active session if uncompleted |
| `POST` | `/workouts/sessions/:id/sets` | Bearer | Log a completed exercise set (weightKg, reps, rpe) |
| `POST` | `/workouts/sessions/:id/complete` | Bearer | Finalize session, calculate total volume, and trigger PR checks |
| `GET` | `/workouts/history` | Bearer | Retrieve completed session history with pagination |

---

## 5. Nutrition Module (`/nutrition`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/nutrition/meals` | Bearer | Get user's logged meals for specified `date` (YYYY-MM-DD) |
| `POST` | `/nutrition/meals` | Bearer | Log a meal (Breakfast, Lunch, Dinner, Snack) with food items |
| `DELETE` | `/nutrition/meals/:id` | Bearer | Delete logged meal |
| `GET` | `/nutrition/foods/search` | Bearer | Search food library with calorie and macro breakdown |
| `POST` | `/nutrition/foods` | Bearer | Create user-defined custom food item |
| `GET` | `/nutrition/goals` | Bearer | Fetch user's daily calorie and macro targets |
| `PUT` | `/nutrition/goals` | Bearer | Update daily calorie and macro targets |

---

## 6. Body Tracking Module (`/body`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/body/weight` | Bearer | Get weight history with dynamically computed 7-day moving averages |
| `POST` | `/body/weight` | Bearer | Log daily body weight in kg |
| `GET` | `/body/measurements` | Bearer | Retrieve chronological circumference logs (cm) |
| `POST` | `/body/measurements` | Bearer | Record new circumference measurements |
| `GET` | `/body/photos` | Bearer | Retrieve progress photo gallery metadata |
| `POST` | `/body/photos` | Bearer | Upload new progress photo with pose angle tag (`front`, `side`, `back`) |

---

## 7. Analytics Module (`/analytics`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/analytics/volume` | Bearer | Volume distribution by muscle group for date range |
| `GET` | `/analytics/1rm/:exerciseId` | Bearer | Chronological estimated 1RM progression for target exercise |
| `GET` | `/analytics/records` | Bearer | User's all-time personal records (PRs) across all exercises |
| `GET` | `/analytics/summary` | Bearer | High-level training consistency, total tonnage, and streak stats |

---

## 8. AI Copilot & Recommendation Module (`/copilot` and `/gemini`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/copilot/chat` | Optional | Grounded fitness & nutrition conversational chat with optional multi-turn `history` array |
| `GET` | `/copilot/recommendations` | Bearer | Deterministic progressive overload tips and deload advisory |
| `POST` | `/gemini/chat` | Optional | Alias to `/copilot/chat` (Payload: `{ message: string, history?: [{ role: 'user'\|'assistant', text: string }] }`) |
| `GET` | `/gemini/recommendations` | Bearer | Alias to `/copilot/recommendations` |

---

## 9. Health & System Module (`/health`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Liveness probe returning server status and uptime |
| `GET` | `/health/ready` | Public | Readiness probe verifying PostgreSQL database connectivity |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.1.0 | 2026-09-16 | Added optional `history` parameter to `/copilot/chat` and `/gemini/chat` for multi-turn conversational context |
| 1.0.0 | 2026-09-16 | Initial baseline API specification for all system domains |
