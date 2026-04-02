const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const data = require('../fixtures/test-data.json');

test.describe('Module: Admin dashboard', () => {
  test('TC-ADM-01: Non-admin cannot open admin', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
    await page.goto('/admin.html');
    await expect(page).toHaveURL(/index\.html/);
  });

  test('TC-ADM-02: Admin dashboard stats', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await page.goto('/admin.html');
    await expect(page.locator('#stats')).toContainText('Customers');
  });

  test('TC-ADM-03: Recent bookings table', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await page.goto('/admin.html');
    await expect(page.locator('#book-tb tr').first()).toBeVisible();
  });

  test('TC-ADM-04: Mark completed button', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await page.goto('/admin.html');
    const btn = page.locator('.btn-done').first();
    if ((await btn.count()) === 0) {
      test.skip();
      return;
    }
    await btn.click();
    await expect(page.locator('#msg')).not.toContainText('Forbidden');
  });

  test('TC-ADM-05: Add bike requires image URL', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await page.goto('/admin.html');
    await page.locator('#form-bike input[name="brand"]').fill('BrandZ');
    await page.locator('#form-bike input[name="model"]').fill('ModelZ');
    await page.locator('#form-bike input[name="price_per_day"]').fill('20');
    await page.locator('#form-bike').getByRole('button', { name: 'Create bike' }).click();
    await expect(page.locator('#form-bike input[name="image_url"]')).toBeFocused();
  });

  test('TC-ADM-06: Admin nav link visible', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('TC-ADM-07: Dashboard heading', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
  });

  test('TC-ADM-08: Revenue metric present', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await page.goto('/admin.html');
    await expect(page.locator('#stats')).toContainText('Revenue');
  });

  test('TC-ADM-09: Add bike section heading', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Add bike' })).toBeVisible();
  });

  test('TC-ADM-10: Admin stays on dashboard after load', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
    await page.goto('/admin.html');
    await expect(page).toHaveURL(/admin\.html/);
  });
});
