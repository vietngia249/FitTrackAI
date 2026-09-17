---
document: FEATURES
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

# FitTrack AI - Feature Catalog

## 1. Feature Map & Matrix

| Feature Domain | Primary Route | Backend API Slice | Key Capabilities |
|---|---|---|---|
| **Authentication** | `/login`, `/register` | `/api/v1/auth/*` | Email/password, Google GIS One-Tap, JWT rotation, session restore |
| **Dashboard** | `/` | Aggregated | Quick session launcher, weekly volume summary, readiness score |
| **Workouts** | `/workouts` | `/api/v1/workouts/*` | Routine plan builder, active session tracker, set logger with RPE, rest timer |
| **Exercises** | `/exercises` | `/api/v1/exercises/*` | Search, filter by category/equipment/level, custom exercise creator |
| **AI Form Coach** | `/ai-form` | Client-Side CV | Real-time MediaPipe Pose joint tracking, rep counter, audio feedback |
| **Analytics** | `/analytics` | `/api/v1/analytics/*` | Epley 1RM progression charts, muscle volume distribution, PR showcase |
| **Copilot & Insights** | `/insights` | `/api/v1/copilot/*` | Grounded Gemini AI chat, Overload Advisor card, Deload week advisor |
| **Nutrition** | `/nutrition` | `/api/v1/nutrition/*` | Meal logging, calorie/macro meters, USDA food search, custom foods |
| **Body Tracking** | `/progress` | `/api/v1/body/*` | Weight trend with 7-day moving avg, body measurements, progress photos |
| **Profile** | `/profile` | `/api/v1/auth/me` | Biometric profile, theme switcher (dark/light), language switcher (en/vi) |

---

## 2. Feature Specifications

### A. Authentication & Biometrics
- **Registration & Login**: Secure credential authentication via Argon2 password hashing.
- **Google GIS OAuth**: Instant one-click Google Sign-In with server-side token verification via `google-auth-library`.
- **Biometric Profile**: User height (cm), target weight (kg), biological sex, date of birth, activity level (`sedentary`, `lightly_active`, `moderately_active`, `very_active`), and primary fitness goal (`muscle_gain`, `fat_loss`, `strength`, `endurance`).

### B. Workout Planning & Active Session Tracking
- **Routine Builder**: Multi-exercise workout templates with target sets, rep ranges, and rest intervals.
- **Active Session Runner**:
  - Live elapsed duration timer.
  - Interactive set logging with previous weight/reps reference.
  - Rate of Perceived Exertion (RPE 1-10) capture for algorithmic overload calculation.
  - Floating Rest Timer with customizable duration (30s, 60s, 90s, 120s, 180s) and completion audio chime.
  - Offline Resilience: Persists uncompleted session state to `localStorage` to safeguard against accidental page refreshes.

### C. Progressive Overload & Analytics Engine
- **Epley 1RM Estimation**: Computes single-rep maximum from working sets:
  $$\text{1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$$
- **Muscle Volume Distribution**: Recharts pie chart categorizing total lifted volume by target muscle group (Chest, Back, Legs, Shoulders, Arms, Core).
- **Personal Records (PR) Showcase**: Displays all-time max weight and estimated 1RM milestones with session timestamps.
- **Empty State Handling**: When no workouts are logged, shows clean, educational guidance prompts instead of mock data.

### D. Exercise Library & Movement Discovery
- **Comprehensive Database**: 870+ biomechanically indexed exercises covering strength, cardio, stretching, and plyometrics.
- **Progressive Batch Pagination**: Paginated in 48-item increments with "Load More" controls, loading indicator, and total count progress (`48 / 873`).
- **Multi-Vector Filtering**: Filter by muscle target, equipment (barbell, dumbbell, body only, cable, machine, bands), category, and difficulty level.

### E. AI Copilot & Gemini-Style Chat Threads
- **Gemini-Style Multi-Thread Hub**: Supports multiple independent conversation threads with collapsible thread sidebar in drawer.
- **Persistent Chat History**: All threads and messages are persisted in local storage per user (`fittrack_gemini_threads_${userId}`), preserving full history across page reloads.
- **Thread Management**: Create new chats, switch between active threads, automatic title generation from first prompt, copy responses, and delete conversations.
- **Multi-Turn Context Retention**: Previous conversational turns are transmitted to Google Gemini API to maintain conversational memory within active threads.
- **Grounded Gemini Chat**: Communicates with Google Gemini models using strict system prompts pre-loaded with the user's verified weight, age, height, BMI, and 7-day training volume.
- **Medical Disclaimer Guardrail**: Refuses injury diagnosis and directs users to licensed healthcare professionals.
- **Overload Advisor Card**: Heuristic recommendation engine that suggests `+2.5 kg` or `+5.0 kg` load increments based on completed working sets.
- **Deload Advisor**: Detects high-frequency fatigue accumulation and recommends a 40% volume reduction week when readiness falls below 72%.

### E. AI Form Coach (Computer Vision)
- **Real-Time Kinematics**: Computes real-time angular geometry across hips, knees, ankles, shoulders, and elbows.
- **Supported Exercises**:
  - **Squat**: Monitors hip-to-knee parallel depth, knee cave, and torso incline.
  - **Push-up**: Tracks chest-to-ground proximity, elbow flare angle, and plank rigidity.
  - **Deadlift**: Monitors neutral lumbar spine curvature and hip hinge trajectory.
  - **Plank**: Evaluates hip sagging or excessive pike over time.
- **Audio Feedback**: Real-time synthesized speech cues ("Go deeper", "Good repetition", "Keep chest up") via Web Audio API.

### F. Nutrition & Food Logging
- **Meal Segments**: Breakfast, Lunch, Dinner, Snacks.
- **Caloric & Macro Tracker**: Dynamic progress bars tracking Daily Calories, Protein (g), Carbohydrates (g), and Fat (g) against personalized targets.
- **Food Search**: Instant querying across seeded standard foods and user-created custom items.
- **Immutable Log Snapshots**: Captured macros are copied directly into `MealFoodItem` records upon logging.
- **Interactive Food Item Edit**: Allows editing logged items (`servingQty`, unit, and macros) with automatic proportional nutrient recalculation and optional custom overrides.
- **Accessible Item & Meal Deletion**: Prominent, high-contrast delete actions with confirmation dialogues to prevent accidental data loss.

### G. Body Tracking & Progress
- **Weigh-in History**: Daily weight logs rendered on a responsive Recharts timeline.
- **7-Day Moving Average**: Smoothed trendline that filters out day-to-day water retention fluctuations.
- **Circumference Measurements**: Neck, Shoulders, Chest, Biceps, Forearms, Waist, Hips, Thighs, Calves (strictly in cm).
- **Progress Photos**: Front, Side, and Back progress photo comparison viewer.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.2.0 | 2026-09-16 | Added logged food item edit dialog with proportional macro recalculation and accessible delete capabilities |
| 1.1.0 | 2026-09-16 | Added Exercises batch pagination (873 items) and Gemini-style multi-thread persistent AI chat history |
| 1.0.0 | 2026-09-16 | Initial baseline cataloging all platform features, specs, and mathematical formulas |
