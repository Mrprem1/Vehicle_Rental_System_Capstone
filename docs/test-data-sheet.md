# Test data sheet

## Valid
| Field | Value | Notes |
|-------|-------|-------|
| Admin email | `admin@bike.local` | After `npm run db:init` |
| Customer email | `customer@bike.local` | |
| Password | `Test@123` | Meets complexity rules |
| Success card | `4532015112830366` | Passes Luhn |
| Decline card | `4111111111111111` | Simulated issuer decline |
| Expiry | Dynamic `MMYY` +2 years | e.g. from test helper |
| CVV | `123` | |

## Invalid
| Case | Value | Expected API/UI |
|------|-------|-----------------|
| Bad password | `short` | Register validation |
| Wrong login | `bad` | Invalid credentials |
| Invalid PAN | `1234567890123456` | Invalid card number |
| Expired | `0100` | Card expired |
| CVV | `12` | Invalid CVV |

## Boundary
| Case | Input | Expected |
|------|-------|----------|
| Booking window | Same second pick/drop | Drop-off after pick-up rule |
| Price filter | min > max | Empty or logical handling via filters |
| Review duplicate | Same user + bike | 409 message |
