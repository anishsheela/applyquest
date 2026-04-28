# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Backend (runs on port 8000)
make backend

# Frontend (runs on port 3000, proxies /api to localhost:8000)
make frontend

# Run all tests
make test

# Backend tests only (uses applyquest_test DB)
make test-backend

# Run a single backend test file
cd backend && .venv/bin/pytest tests/test_gamification.py -v

# Frontend tests
make test-frontend
```

### Database migrations

```bash
cd backend && .venv/bin/alembic upgrade head
cd backend && .venv/bin/alembic revision --autogenerate -m "description"
```

### Backend environment

Requires a `.env` file in `backend/` with:
```
POSTGRES_SERVER=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
SECRET_KEY=
RESEND_API_KEY=
```

## Architecture

### Single-user design

This app is built for a single user (configured via `USER_EMAIL` in settings). The scheduler, streak tracking, and email notifications all target this one user. The `Share` endpoint provides a read-only mentor view authenticated by a simple shared password (`SHARE_PASSWORD`).

### Backend (`backend/app/`)

**FastAPI + SQLAlchemy + PostgreSQL.** All routes live under `/api/v1` (defined in `api/v1/api.py`). JWT-based auth with a 1-week token expiry (`core/security.py`).

Key data flows:
- Every mutating application action goes through `core/gamification.add_points()` which creates a `PointHistory` record and recalculates `user.level` and `user.current_streak` atomically before the caller commits.
- Streak logic uses Berlin timezone (`Europe/Berlin`) and skips weekends/holidays defined in `backend/data/` JSON files (`german_holidays.json`, `kerala_holidays.json`, `leaves.json`). The `core/working_days.py` module handles this.
- Scheduled jobs (APScheduler `BackgroundScheduler`) run in `core/scheduler.py`: daily reminder at 20:00, streak check at 00:05, weekly summary on Sunday 19:00, and a follow-up digest at 09:00 — all Berlin time.

Models: `User`, `Application` + `ApplicationHistory`, `NetworkContact`, `PointHistory` (in `app/models/`).

**Follow-up logic** (`core/followup.py`): applications are classified as `needs_followup` (≥7 days stale, no follow-up sent), `awaiting_response` (<3 days since follow-up), or `needs_decision` (≥3 days since follow-up).

### Frontend (`frontend/src/`)

**React + TypeScript + Tailwind CSS.** Uses `react-router-dom` v7 and `recharts` for analytics.

- All API calls go through `services/api.ts`, which manually maps snake_case backend fields to camelCase TypeScript types. There is no auto-transformation library.
- Global state (user, applications, contacts, auth status) lives in `context/AppContext.tsx`. All pages consume this context rather than fetching data independently.
- Two auth modes: regular user (JWT token in `localStorage`) and mentor view (password-based, read-only via the share endpoint).
- The dev server proxies `/api` to `http://localhost:8000` (set in `package.json`).

### Firefox Extension (`extension/`)

Plain HTML/CSS/JS, no build step. Manifest V3, Firefox-only (`browser.*` APIs).

**Three JS contexts:**
- `background.js` — service worker; the only code that calls the ApplyQuest API. Handles messages: `DO_LOGIN`, `SAVE_JOB`, `GET_SETTINGS`, `CLEAR_AUTH`. All `fetch()` calls go here to avoid page CSP issues.
- `content/` — injected into job pages on load. Six files loaded in order: five site extractors (`linkedin.js`, `indeed.js`, `glassdoor.js`, `xing.js`, `stepstone.js`) each defining a global `extractX()` function, plus `extractor.js` which is the message listener that routes `EXTRACT_JOB` to the right function and responds with `{ success, data }`.
- `popup.js` — toolbar popup UI. On open: queries active tab, sends `EXTRACT_JOB` to content script, populates the form. On submit: sends `SAVE_JOB` to background.

**Auth:** JWT token stored in `browser.storage.local`. Settings page (`settings.html`) handles first-run login. Token expires in 1 week (matching backend); on 401 the popup shows a reconnect prompt.

**To load in Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `extension/manifest.json`.

**CORS:** `backend/app/main.py` uses `allow_origin_regex=r"moz-extension://.*"` with `allow_credentials=False` (safe — the app uses Bearer tokens, not cookies).

### Points system

- Create application: +2 pts
- Status change to interview stages: +5–15 pts depending on stage
- Milestones (10/25/50/100 applications) trigger email notifications via Resend API (`core/email.py`).
- Levels: 1 (0 pts) → 6 "Offer Magnet" (1500 pts), defined in `core/gamification.py`.
