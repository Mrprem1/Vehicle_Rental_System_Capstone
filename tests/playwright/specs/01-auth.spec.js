const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { RegisterPage } = require('../pages/RegisterPage');
const data = require('../fixtures/test-data.json');

test.describe('Module: User registration & login', () => {
  test('TC-AUTH-01: Login page loads with form fields', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login.html');
    await expect(login.email).toBeVisible();
    await expect(login.password).toBeVisible();
    await expect(login.submit).toBeVisible();
  });

  test('TC-AUTH-02: Valid customer login redirects to bikes', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
    await expect(page).toHaveURL(/bikes\.html/);
  });

  test('TC-AUTH-03: Invalid password shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login.html');
    await login.email.fill(data.customer.email);
    await login.password.fill('WrongPass1!');
    await login.submit.click();
    await expect(page.locator('.msg-error')).toBeVisible();
  });

  test('TC-AUTH-04: Register with weak password shows validation', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto('/register.html');
    await reg.name.fill('Test User');
    await reg.email.fill(`weak_${Date.now()}@test.local`);
    await reg.password.fill('short');
    await reg.submit.click();
    await expect(page.locator('.msg-error')).toBeVisible();
  });

  test('TC-AUTH-05: Register new customer succeeds', async ({ page }) => {
    const email = `user_${Date.now()}@test.local`;
    const reg = new RegisterPage(page);
    await reg.register('New Customer', email, 'Str0ng!Pass');
    await expect(page).toHaveURL(/bikes\.html/);
  });

  test('TC-AUTH-06: Duplicate email registration fails', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.registerExpectError('Dup', data.customer.email, 'Str0ng!Pass');
    await expect(page.locator('.msg-error')).toBeVisible();
  });

  test('TC-AUTH-07: Admin can login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await expect(page).toHaveURL(/bikes\.html/);
    await page.goto('/admin.html');
    await expect(page.locator('h1')).toContainText('Admin');
  });

  test('TC-AUTH-08: Logout clears session', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/index\.html/);
  });

  test('TC-AUTH-09: Home page loads', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('TC-AUTH-10: Guest can open register page', async ({ page }) => {
    await page.goto('/register.html');
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  });

  test('TC-AUTH-11: Login email field is required', async ({ page }) => {
    await page.goto('/login.html');
    await expect(page.getByTestId('login-email')).toHaveAttribute('required', '');
  });

  test('TC-AUTH-12: Customer session shows My bookings nav', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
    await expect(page.getByRole('link', { name: 'My bookings' })).toBeVisible();
  });
});
