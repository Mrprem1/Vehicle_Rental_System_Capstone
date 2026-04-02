# Test Strategy — Bike Rental System

## Objectives
- Validate functional correctness of all 10 modules across UI with a real Chrome browser.
- Confirm business rules: JWT auth, overlapping bookings, maintenance windows, payment Luhn/expiry/decline rules, one review per user per bike.
- Provide traceability from requirements to automated tests (Playwright) and manual test cases (Excel-style tables in `test-plan.md`).

## Levels
| Level        | Scope                                      | Tool / Owner      |
|-------------|---------------------------------------------|-------------------|
| Unit        | Pure functions (payment Luhn, overlap math) | Node (optional)   |
| Integration | API + MySQL                                 | Manual / Postman  |
| System      | End-to-end UI flows                         | Playwright        |
| Regression  | Full Playwright suite on release            | Playwright CI     |

## Types
- Functional, UI, negative, boundary (dates, price filters, card expiry).
- Database checks via documented SQL in `database/queries-validation.sql` (manual / DBA).

## Risks & Mitigations
| Risk                         | Mitigation                                      |
|-----------------------------|-------------------------------------------------|
| MySQL not running locally   | Docker Compose + documented `.env`            |
| Parallel booking collisions | Date offsets per worker in tests                |
| Flaky network images        | Unsplash URLs + lazy loading in UI              |

## Exit Criteria
- Playwright suite green on Chrome with seeded DB.
- No open Critical/High defects for release candidate.
