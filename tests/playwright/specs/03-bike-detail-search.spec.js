const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const data = require('../fixtures/test-data.json');

test.describe('Module: Bike details & search/filters', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-DET-01: Bike detail shows specs', async ({ page }) => {
    await page.goto('/bike-detail.html?id=1');
    await expect(page.locator('h1')).toContainText('Trek');
    await expect(page.locator('.detail-specs')).toContainText('Price');
  });

  test('TC-DET-02: Book button on detail', async ({ page }) => {
    await page.goto('/bike-detail.html?id=2');
    await page.getByRole('link', { name: 'Book this bike' }).click();
    await expect(page).toHaveURL(/booking\.html/);
    await expect(page.getByTestId('book-bike-id')).toHaveValue('2');
  });

  test('TC-DET-03: Missing id shows error', async ({ page }) => {
    await page.goto('/bike-detail.html');
    await expect(page.locator('.msg-error')).toContainText('Missing');
  });

  test('TC-DET-04: Reviews section visible', async ({ page }) => {
    await page.goto('/bike-detail.html?id=3');
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
  });

  test('TC-DET-05: Search filters combined on bikes page', async ({ page }) => {
    await page.goto('/bikes.html');
    await page.locator('#f-type').selectOption('electric');
    await page.locator('#f-search').fill('Specialized');
    await page.getByTestId('filter-apply').click();
    await expect(page.locator('.bike-card')).toHaveCount(1);
  });

  test('TC-DET-06: Image loads on detail', async ({ page }) => {
    await page.goto('/bike-detail.html?id=1');
    await expect(page.locator('.detail-img')).toBeVisible();
  });

  test('TC-DET-07: Rating displayed', async ({ page }) => {
    await page.goto('/bike-detail.html?id=1');
    await expect(page.locator('text=★')).toBeVisible();
  });

  test('TC-DET-08: Invalid bike id shows not found from API', async ({ page }) => {
    await page.goto('/bike-detail.html?id=99999');
    await expect(page.locator('.msg-error')).toContainText(/not found|Bike/i, { timeout: 15000 });
  });

  test('TC-DET-09: Filter electric type', async ({ page }) => {
    await page.goto('/bikes.html');
    await page.locator('#f-type').selectOption('electric');
    await page.getByTestId('filter-apply').click();
    await expect(page.locator('.bike-meta', { hasText: 'electric' }).first()).toBeVisible();
  });

  test('TC-DET-10: Clear search shows all', async ({ page }) => {
    await page.goto('/bikes.html');
    await page.locator('#f-search').fill('zzzznomatch');
    await page.getByTestId('filter-apply').click();
    await expect(page.locator('#grid .bike-card')).toHaveCount(0);
    await page.locator('#f-search').fill('');
    await page.getByTestId('filter-apply').click();
    await expect(page.locator('#grid .bike-card').first()).toBeVisible();
  });

  test('TC-DET-11: Hybrid filter', async ({ page }) => {
    await page.goto('/bikes.html');
    await page.locator('#f-type').selectOption('hybrid');
    await page.getByTestId('filter-apply').click();
    await expect(page.locator('.bike-card')).toHaveCount(1);
  });

  test('TC-DET-12: Mountain bikes listed', async ({ page }) => {
    await page.goto('/bikes.html');
    await page.locator('#f-type').selectOption('mountain');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByText('Trance')).toBeVisible();
  });
});
