# RideHub — Bike Rental System

Full-stack bike rental application (vanilla HTML/CSS/JS + Node/Express + MySQL) with STLC-style QA docs and Playwright UI automation (Page Object Model).

## Prerequisites

- **Node.js** 18+
- **MySQL 8** (local install) **or** Docker (see below)

## Quick start

1. **Clone / open this folder** in a terminal.

2. **Environment file**

   ```bash
   copy .env.example .env
   ```

   Edit `.env` and set `DB_PASSWORD` to match your MySQL `root` password (leave empty only if MySQL allows passwordless root).

3. **Install dependencies**

   ```bash
   npm install
   npm run playwright:install
   ```

4. **Database**

   - Start MySQL.
   - Optional Docker:

     ```bash
     docker compose up -d
     ```

     Then set in `.env`: `DB_PASSWORD=root` (matches `docker-compose.yml`).

   - Initialize schema + seed users and bikes:

     ```bash
     npm run db:init
     ```

5. **Run the app**

   ```bash
   npm start
   ```

   Open **http://localhost:3000**

### Seeded accounts

| Role     | Email               | Password  |
|----------|---------------------|-----------|
| Admin    | `admin@bike.local`  | `Test@123` |
| Customer | `customer@bike.local` | `Test@123` |
| Customer | `customer2@bike.local` | `Test@123` |

## Playwright tests (Chrome / Chromium)

Requires a working database (step 4). The Playwright config starts the API automatically and runs `npm run db:init` in **global setup** (re-seeds data).

```bash
npm test
```

HTML report:

```bash
npm run test:report
```

## Project layout

- `public/` — Frontend (pages, `css/styles.css`, `js/api.js`, `js/layout.js`)
- `server/` — Express API (MVC-style controllers, routes, middleware)
- `database/` — `schema.sql`, `seed.sql`, `queries-validation.sql`
- `scripts/init-db.js` — Creates DB, users (bcrypt), sample bikes
- `tests/playwright/` — POM (`pages/`), specs (`specs/`), fixtures, utils
- `docs/` — Test strategy, plan, cases, templates, framework diagram

## API overview

- `POST /api/auth/register` · `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/bikes` (admin for mutations)
- `GET/POST /api/bookings` · `PATCH /api/bookings/:id`
- `POST /api/payments/simulate`
- `GET/POST /api/reviews`
- `GET/PUT /api/profile` · `GET /api/profile/history`
- `GET /api/admin/dashboard` (admin)

JWT: `Authorization: Bearer <token>`.

## Troubleshooting

- **`ER_ACCESS_DENIED_ERROR`**: Fix `DB_USER` / `DB_PASSWORD` in `.env`; confirm MySQL is listening on `DB_HOST`:`DB_PORT`.
- **Port 3000 in use**: Set `PORT` in `.env`.
- **Playwright browser missing**: Run `npm run playwright:install`.

## License

Educational / portfolio use.
