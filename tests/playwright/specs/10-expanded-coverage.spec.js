const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const data = require('../fixtures/test-data.json');

test.describe('Module: API smoke', () => {
  test('TC-API-01: Health endpoint responds', async ({ request }) => {
    const r = await request.get('/api/health');
    expect(r.ok()).toBeTruthy();
  });

  test('TC-API-02: Health JSON shape', async ({ request }) => {
    const r = await request.get('/api/health');
    const j = await r.json();
    expect(j.ok).toBe(true);
    expect(j.service).toContain('bike');
  });

  test('TC-API-03: Bikes list is public', async ({ request }) => {
    const r = await request.get('/api/bikes');
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('TC-API-04: Single bike by id', async ({ request }) => {
    const r = await request.get('/api/bikes/1');
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    expect(body.data).toBeTruthy();
    expect(body.data.id).toBe(1);
  });

  test('TC-API-10: Unknown bike returns 404', async ({ request }) => {
    const r = await request.get('/api/bikes/999999');
    expect(r.status()).toBe(404);
  });
});

test.describe('Module: API auth boundaries', () => {
  test('TC-API-05: Bookings require auth', async ({ request }) => {
    const r = await request.get('/api/bookings');
    expect(r.status()).toBe(401);
  });

  test('TC-API-06: Profile requires auth', async ({ request }) => {
    const r = await request.get('/api/profile');
    expect(r.status()).toBe(401);
  });

  test('TC-API-07: Payments simulate requires auth', async ({ request }) => {
    const r = await request.post('/api/payments/simulate', {
      data: {
        booking_id: 1,
        card_number: data.validCard,
        expiry: '1230',
        cvv: '123',
        method: 'card',
      },
    });
    expect(r.status()).toBe(401);
  });

  test('TC-API-08: Create review requires auth', async ({ request }) => {
    const r = await request.post('/api/reviews', {
      data: { bike_id: 1, rating: 5, comment: 'x' },
    });
    expect(r.status()).toBe(401);
  });

  test('TC-API-09: Admin dashboard requires auth', async ({ request }) => {
    const r = await request.get('/api/admin/dashboard');
    expect(r.status()).toBe(401);
  });
});

test.describe('Module: Public pages', () => {
  test('TC-PUB-01: Index loads title', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('TC-PUB-02: Bikes page loads heading', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.getByRole('heading', { name: /bike inventory/i })).toBeVisible();
  });

  test('TC-PUB-03: Login page Sign in heading', async ({ page }) => {
    await page.goto('/login.html');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('TC-PUB-04: Register page Create account', async ({ page }) => {
    await page.goto('/register.html');
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  });

  test('TC-PUB-05: Bike detail guest can open read-only-ish', async ({ page }) => {
    await page.goto('/bike-detail.html?id=1');
    await expect(page.locator('h1')).toContainText(/trek/i);
  });

  test('TC-PUB-06: Bike detail second id loads', async ({ page }) => {
    await page.goto('/bike-detail.html?id=2');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Module: Customer UI extras', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-CUST-01: Bikes nav from grid', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.getByTestId('filter-apply')).toBeVisible();
  });

  test('TC-CUST-02: Filter type select has options', async ({ page }) => {
    await page.goto('/bikes.html');
    const sel = page.locator('#f-type');
    await expect(sel).toBeVisible();
    await expect(sel.locator('option').first()).toBeAttached();
  });

  test('TC-CUST-03: Max price input exists', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.locator('#f-max')).toBeVisible();
  });

  test('TC-CUST-04: My bookings heading', async ({ page }) => {
    await page.goto('/my-bookings.html');
    await expect(page.getByRole('heading', { name: 'My bookings' })).toBeVisible();
  });

  test('TC-CUST-05: Profile heading', async ({ page }) => {
    await page.goto('/profile.html');
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });

  test('TC-CUST-06: Payment page heading when logged in', async ({ page }) => {
    await page.goto('/payment.html');
    await expect(page.getByRole('heading', { name: /payment/i })).toBeVisible();
  });

  test('TC-CUST-07: Booking page bike id field', async ({ page }) => {
    await page.goto('/booking.html');
    await expect(page.getByTestId('book-bike-id')).toBeVisible();
  });

  test('TC-CUST-08: Booking pickup required', async ({ page }) => {
    await page.goto('/booking.html');
    await expect(page.getByTestId('book-pickup')).toHaveAttribute('required', '');
  });

  test('TC-CUST-09: Logo links home', async ({ page }) => {
    await page.goto('/bikes.html');
    await page.getByRole('link', { name: /ridehub/i }).click();
    await expect(page).toHaveURL(/index\.html/);
  });

  test('TC-CUST-10: Detail book link has bike id', async ({ page }) => {
    await page.goto('/bike-detail.html?id=3');
    await expect(page.getByRole('link', { name: 'Book this bike' })).toHaveAttribute(
      'href',
      /bike_id=3/
    );
  });
});

test.describe('Module: Admin API with token', () => {
  test('TC-ADM-API-01: Dashboard JSON when admin', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { email: data.admin.email, password: data.admin.password },
    });
    expect(loginRes.ok()).toBeTruthy();
    const { token } = await loginRes.json();
    const dash = await request.get('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(dash.ok()).toBeTruthy();
    const body = await dash.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeTruthy();
  });
});

test.describe('Module: Navigation consistency', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-NAV-01: Profile link in header', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
  });

  test('TC-NAV-02: My bookings link', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.getByRole('link', { name: 'My bookings' })).toBeVisible();
  });

  test('TC-NAV-03: Bikes link from profile', async ({ page }) => {
    await page.goto('/profile.html');
    await page.getByRole('link', { name: 'Bikes' }).click();
    await expect(page).toHaveURL(/bikes\.html/);
  });
});

test.describe('Module: Form accessibility extras', () => {
  test('TC-A11Y-01: Login email has label', async ({ page }) => {
    await page.goto('/login.html');
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('TC-A11Y-02: Register password type', async ({ page }) => {
    await page.goto('/register.html');
    await expect(page.getByTestId('reg-password')).toHaveAttribute('type', 'password');
  });

  test('TC-A11Y-03: Payment card label for', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
    await page.goto('/payment.html');
    await expect(page.getByLabel(/card number/i)).toBeVisible();
  });
});

test.describe('Module: Bike detail content', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-DET-X-01: Stock shown', async ({ page }) => {
    await page.goto('/bike-detail.html?id=1');
    await expect(page.locator('.detail-specs')).toContainText(/stock/i);
  });

  test('TC-DET-X-02: Price format', async ({ page }) => {
    await page.goto('/bike-detail.html?id=2');
    await expect(page.locator('.detail-specs')).toContainText('$');
  });

  test('TC-DET-X-03: Review form has rating', async ({ page }) => {
    await page.goto('/bike-detail.html?id=4');
    await expect(page.locator('#rv-rating')).toBeVisible();
  });

  test('TC-DET-X-04: Review comment textarea', async ({ page }) => {
    await page.goto('/bike-detail.html?id=5');
    await expect(page.locator('#rv-comment')).toBeVisible();
  });
});

test.describe('Module: Reviews API list', () => {
  test('TC-REV-API-01: Reviews list for bike', async ({ request }) => {
    const r = await request.get('/api/reviews?bike_id=1');
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

test.describe('Module: More customer flows', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-MORE-01: Bikes page has grid', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.locator('#grid')).toBeAttached();
  });

  test('TC-MORE-02: Search input present', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.locator('#f-search')).toBeVisible();
  });

  test('TC-MORE-03: Available checkbox', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.locator('#f-avail')).toBeVisible();
  });

  test('TC-MORE-04: Booking notes maxlength', async ({ page }) => {
    await page.goto('/booking.html');
    await expect(page.locator('#notes')).toHaveAttribute('maxlength', '500');
  });

  test('TC-MORE-05: Payment expiry pattern', async ({ page }) => {
    await page.goto('/payment.html');
    await expect(page.getByTestId('pay-expiry')).toHaveAttribute('pattern', String.raw`\d{4}`);
  });

  test('TC-MORE-06: Profile save button exists', async ({ page }) => {
    await page.goto('/profile.html');
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test('TC-MORE-07: My bookings table thead', async ({ page }) => {
    await page.goto('/my-bookings.html');
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
  });

  test('TC-MORE-08: Detail layout class', async ({ page }) => {
    await page.goto('/bike-detail.html?id=1');
    await expect(page.locator('.detail-layout')).toBeVisible();
  });

  test('TC-MORE-09: Logout button present', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('TC-MORE-10: Admin hidden for customer', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
  });

  test('TC-MORE-11: Min price filter present', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.locator('#f-min')).toBeVisible();
  });

  test('TC-MORE-12: Brand filter present', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.locator('#f-brand')).toBeVisible();
  });
});

test.describe('Module: Admin UI extras', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
  });

  test('TC-ADM-UI-01: Admin h1', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
  });

  test('TC-ADM-UI-02: Create bike button', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('button', { name: 'Create bike' })).toBeVisible();
  });

  test('TC-ADM-UI-03: Recent bookings heading', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Recent bookings' })).toBeVisible();
  });

  test('TC-ADM-UI-04: Admin link visible', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('TC-ADM-UI-05: Stock input default', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.locator('#form-bike input[name="stock"]')).toHaveValue('1');
  });
});

test.describe('Module: Register validation surface', () => {
  test('TC-REG-01: Submit empty shows server validation', async ({ page }) => {
    await page.goto('/register.html');
    await page.getByTestId('reg-submit').click();
    await expect(page.locator('.msg-error')).toBeVisible();
  });
});

test.describe('Module: Login validation surface', () => {
  test('TC-LOG-01: Email required attr', async ({ page }) => {
    await page.goto('/login.html');
    await expect(page.getByTestId('login-email')).toHaveAttribute('required', '');
  });
});
