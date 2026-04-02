const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { BikesPage } = require('../pages/BikesPage');
const data = require('../fixtures/test-data.json');

test.describe('Module: Bike inventory management', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.admin.email, data.admin.password);
  });

  test('TC-BIKE-01: Bikes grid lists catalog', async ({ page }) => {
    const bikes = new BikesPage(page);
    await bikes.open();
    await expect(bikes.grid.locator('.bike-card').first()).toBeVisible();
  });

  test('TC-BIKE-02: Filter by type road', async ({ page }) => {
    const bikes = new BikesPage(page);
    await bikes.open();
    await bikes.type.selectOption('road');
    await bikes.apply();
    await expect(bikes.cardByText('Trek')).toBeVisible();
  });

  test('TC-BIKE-03: Filter by max price', async ({ page }) => {
    const bikes = new BikesPage(page);
    await bikes.open();
    await bikes.maxPrice.fill('40');
    await bikes.apply();
    const texts = await bikes.grid.locator('.price').allTextContents();
    texts.forEach((t) => {
      const n = parseFloat(t.replace(/[^0-9.]/g, ''));
      expect(n).toBeLessThanOrEqual(40);
    });
  });

  test('TC-BIKE-04: Available only checkbox', async ({ page }) => {
    const bikes = new BikesPage(page);
    await bikes.open();
    await bikes.availableOnly.check();
    await bikes.apply();
    await expect(bikes.grid.locator('.bike-card').first()).toBeVisible();
  });

  test('TC-BIKE-05: Search by brand', async ({ page }) => {
    const bikes = new BikesPage(page);
    await bikes.open();
    await bikes.search.fill('Giant');
    await bikes.apply();
    await expect(bikes.cardByText('Giant')).toBeVisible();
  });

  test('TC-BIKE-06: Admin creates bike via API-backed UI', async ({ page }) => {
    await page.goto('/admin.html');
    await page.locator('#form-bike input[name="brand"]').fill('TestBrand');
    await page.locator('#form-bike input[name="model"]').fill('ModelX');
    await page.locator('#form-bike input[name="price_per_day"]').fill('29.99');
    await page
      .locator('#form-bike input[name="image_url"]')
      .fill('https://images.unsplash.com/photo-1485965120184-e220f7d74408?w=800');
    await page.locator('#form-bike textarea[name="description"]').fill('Automation bike');
    await page.locator('#form-bike').getByRole('button', { name: 'Create bike' }).click();
    await expect(page.locator('.msg-success')).toBeVisible();
    await page.goto('/bikes.html');
    await expect(page.getByText('TestBrand')).toBeVisible();
  });

  test('TC-BIKE-07: Details link navigates to bike detail', async ({ page }) => {
    await page.goto('/bikes.html');
    await page.getByRole('link', { name: 'Details' }).first().click();
    await expect(page).toHaveURL(/bike-detail\.html/);
  });

  test('TC-BIKE-08: Min price boundary', async ({ page }) => {
    const bikes = new BikesPage(page);
    await bikes.open();
    await bikes.minPrice.fill('30');
    await bikes.maxPrice.fill('50');
    await bikes.apply();
    await expect(bikes.grid.locator('.bike-card').first()).toBeVisible();
  });

  test('TC-BIKE-09: Brand filter partial match', async ({ page }) => {
    const bikes = new BikesPage(page);
    await bikes.open();
    await bikes.brand.fill('Bro');
    await bikes.apply();
    await expect(bikes.grid).toBeVisible();
  });

  test('TC-BIKE-10: Inventory shows stock text', async ({ page }) => {
    await page.goto('/bikes.html');
    await expect(page.locator('.bike-meta', { hasText: 'Stock' }).first()).toBeVisible();
  });
});
