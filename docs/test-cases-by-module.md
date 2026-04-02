# Test scenarios by module (manual + automated traceability)

Automated cases use IDs `TC-*` matching Playwright spec names where applicable. Each module lists **12** representative scenarios (positive, negative, boundary).

## 1. User registration & login (TC-AUTH-*)
| ID | Type | Description | Expected |
|----|------|-------------|----------|
| TC-AUTH-01 | Positive | Login page shows email/password | Form visible |
| TC-AUTH-02 | Positive | Valid customer login | Redirect to `bikes.html` |
| TC-AUTH-03 | Negative | Wrong password | Error message |
| TC-AUTH-04 | Negative | Weak password on register | Validation error |
| TC-AUTH-05 | Positive | New user register | Session + redirect |
| TC-AUTH-06 | Negative | Duplicate email | Conflict message |
| TC-AUTH-07 | Positive | Admin login + admin page | Dashboard loads |
| TC-AUTH-08 | Positive | Logout | Session cleared |
| TC-AUTH-09 | Positive | Home loads | Hero visible |
| TC-AUTH-10 | Positive | Register page guest | Form visible |
| TC-AUTH-11 | Boundary | Required email attribute | HTML5 required |
| TC-AUTH-12 | Positive | Nav shows My bookings when logged in | Link visible |

## 2. Bike inventory management (TC-BIKE-*)
| ID | Type | Description | Expected |
|----|------|-------------|----------|
| TC-BIKE-01 | Positive | Grid lists bikes | Cards visible |
| TC-BIKE-02 | Positive | Filter type road | Trek visible |
| TC-BIKE-03 | Boundary | Max price 40 | Prices ≤ 40 |
| TC-BIKE-04 | Positive | Available only | Cards load |
| TC-BIKE-05 | Positive | Search Giant | Giant card |
| TC-BIKE-06 | Positive | Admin create bike | Success + listed |
| TC-BIKE-07 | Positive | Details link | `bike-detail.html` |
| TC-BIKE-08 | Boundary | Min/max price range | Results in band |
| TC-BIKE-09 | Positive | Partial brand | Grid renders |
| TC-BIKE-10 | Positive | Stock in meta | Text “Stock” |

## 3. Bike details + search/filters (TC-DET-*)
Covers detail page and combined filters (modules 3 & 4 in app architecture).

## 4. Booking (TC-BOOK-*)
| ID | Type | Description | Expected |
|----|------|-------------|----------|
| TC-BOOK-01 | Negative | Guest booking | Redirect login |
| TC-BOOK-02 | Positive | Create booking | Success + id |
| TC-BOOK-03 | Negative | Drop-off before pick-up | Error |
| TC-BOOK-04 | Negative | Past pick-up | Error |
| TC-BOOK-05 | Negative | Overlap same bike | Overlap message |
| TC-BOOK-06 | Positive | Datetime fields | Visible |
| TC-BOOK-07 | Positive | Notes optional | Success |
| TC-BOOK-08 | Negative | Invalid bike id | Error |
| TC-BOOK-09 | Positive | Detail prefills bike | Value set |
| TC-BOOK-10 | Boundary | Multi-day rental | Success |

## 5. Booking management (TC-MGMT-*)
Cancel, reschedule, pay link, table columns, guest guard.

## 6. Payment simulation (TC-PAY-*)
Valid Luhn success, decline PAN `4111111111111111`, invalid PAN, expired MMYY, short CVV, guest redirect, query param prefill, retry after decline.

## 7. Ratings & reviews (TC-REV-*)
List, submit after pay, guest redirect, duplicate blocked, long comment, empty comment.

## 8. Admin dashboard (TC-ADM-*)
RBAC (customer redirected), stats, recent bookings, mark completed, add bike validation, headings.

## 9. User profile (TC-PROF-*)
Load email, update name/phone, wrong password, guest redirect, layout, disabled email, history table.

## 10. Cross-cutting / DB (manual)
Run `database/queries-validation.sql` for joins, overlap audit, payment aggregates.
