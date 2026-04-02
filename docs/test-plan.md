# Test Plan — Bike Rental System

## Scope
- In scope: All UI modules in `public/`, REST API behavior observable from UI, MySQL persistence via `scripts/init-db.js`.
- Out of scope (per constraints): dedicated API-only tests, performance, security penetration, non-Chrome browsers.

## Objectives
- Verify registration/login, inventory CRUD (admin), browse/filter/detail, booking lifecycle, payment simulation, reviews, profile, admin dashboard.
- Exercise negative paths: invalid credentials, overlap, invalid card, expired card, declined PAN, duplicate review.

## Environments
- **Local:** Node 18+, MySQL 8, `.env` from `.env.example`.
- **Docker DB:** `docker compose up -d` then set `DB_PASSWORD=root`.

## Entry / Exit
- Entry: DB initialized, `npm start`, health `GET /api/health` returns 200.
- Exit: All Playwright tests pass; manual spot-check of critical flows per release.

## Risks
- Environment drift (wrong DB password): highest frequency; mitigated by README troubleshooting.

## Test Levels
- System UI (primary): Playwright.
- DB validation: SQL scripts (manual execution).

See `test-cases-by-module.md` for scenario IDs and `test-data-sheet.md` for sample values.
