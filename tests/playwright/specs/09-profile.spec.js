const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ProfilePage } = require('../pages/ProfilePage');
const data = require('../fixtures/test-data.json');

test.describe('Module: User profile', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-PROF-01: Profile loads user email', async ({ page }) => {
    const prof = new ProfilePage(page);
    await prof.open();
    await expect(prof.fullName).toBeVisible();
    await expect(page.locator('#email')).toHaveValue(data.customer.email);
  });

  test('TC-PROF-02: Update name', async ({ page }) => {
    const prof = new ProfilePage(page);
    await prof.open();
    await prof.fullName.fill('Customer One Updated');
    await prof.submit.click();
    await expect(page.locator('.msg-success')).toContainText('Saved');
    await prof.fullName.fill('Customer One');
    await prof.submit.click();
  });

  test('TC-PROF-03: History table or empty', async ({ page }) => {
    const prof = new ProfilePage(page);
    await prof.open();
    await expect(prof.historyTable).toBeVisible();
  });

  test('TC-PROF-04: Phone update', async ({ page }) => {
    const prof = new ProfilePage(page);
    await prof.open();
    await prof.phone.fill('555-9999');
    await prof.submit.click();
    await expect(page.locator('.msg-success')).toBeVisible();
  });

  test('TC-PROF-05: Wrong current password fails', async ({ page }) => {
    await page.goto('/profile.html');
    await page.locator('#cur_pw').fill('wrong');
    await page.locator('#new_pw').fill('NewStr0ng!Pass');
    await page.locator('#form-prof').locator('button[type="submit"]').click();
    await expect(page.locator('.msg-error')).toContainText(/incorrect|password/i);
  });

  test('TC-PROF-06: Guest redirected', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/profile.html');
    await expect(page).toHaveURL(/login\.html/);
  });

  test('TC-PROF-07: Profile layout two columns desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/profile.html');
    await expect(page.locator('.detail-layout')).toBeVisible();
  });

  test('TC-PROF-08: Email disabled', async ({ page }) => {
    await page.goto('/profile.html');
    await expect(page.locator('#email')).toBeDisabled();
  });

  test('TC-PROF-09: Rental history headers', async ({ page }) => {
    await page.goto('/profile.html');
    await expect(page.getByRole('columnheader', { name: 'Bike' })).toBeVisible();
  });

  test('TC-PROF-10: Save without password fields', async ({ page }) => {
    await page.goto('/profile.html');
    await page.locator('#cur_pw').fill('');
    await page.locator('#new_pw').fill('');
    await page.locator('#full_name').fill('Customer One');
    await page.locator('#form-prof').locator('button[type="submit"]').click();
    await expect(page.locator('.msg-success')).toBeVisible();
  });
});
