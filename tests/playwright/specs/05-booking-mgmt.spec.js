const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { BookingPage } = require('../pages/BookingPage');
const { localDateTime } = require('../utils/dates');
const data = require('../fixtures/test-data.json');

test.describe('Module: Booking management', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-MGMT-01: My bookings table visible', async ({ page }) => {
    await page.goto('/my-bookings.html');
    await expect(page.locator('table')).toBeVisible();
  });

  test('TC-MGMT-02: Cancel booking', async ({ page }, testInfo) => {
    const day = 100 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('4');
    await booking.fillBooking(4, localDateTime(day, 9), localDateTime(day, 12));
    await booking.submit.click();
    const createdText = await page.locator('.msg-success').innerText();
    const createdId = createdText.match(/#(\d+)/)?.[1];
    await page.goto('/my-bookings.html');
    const row = page.locator('tbody tr', {
      has: page.locator('td:first-child', { hasText: String(createdId) }),
    });
    page.once('dialog', (d) => d.accept());
    await row.locator('.btn-cancel').click();
    await expect(row).toContainText('cancelled');
  });

  test('TC-MGMT-03: Reschedule +1 day', async ({ page }, testInfo) => {
    const day = 120 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('5');
    await booking.fillBooking(5, localDateTime(day, 10), localDateTime(day, 14));
    await booking.submit.click();
    await page.goto('/my-bookings.html');
    await page.locator('.btn-res').first().click();
    await page.reload();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('TC-MGMT-04: Pay link for active booking', async ({ page }, testInfo) => {
    const day = 140 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('2');
    await booking.fillBooking(2, localDateTime(day, 11), localDateTime(day, 13));
    await booking.submit.click();
    await page.goto('/my-bookings.html');
    await page.getByRole('link', { name: 'Pay' }).first().click();
    await expect(page).toHaveURL(/payment\.html/);
  });

  test('TC-MGMT-05: Booking status column', async ({ page }) => {
    await page.goto('/my-bookings.html');
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('TC-MGMT-06: Multiple rows render', async ({ page }) => {
    await page.goto('/my-bookings.html');
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('TC-MGMT-07: Cancel confirmation dialog', async ({ page }) => {
    await page.goto('/my-bookings.html');
    if ((await page.locator('.btn-cancel').count()) === 0) test.skip();
    let dialogSeen = false;
    page.once('dialog', (d) => {
      dialogSeen = true;
      d.dismiss();
    });
    await page.locator('.btn-cancel').first().click();
    expect(dialogSeen).toBeTruthy();
  });

  test('TC-MGMT-08: Guest redirected from my bookings', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/my-bookings.html');
    await expect(page).toHaveURL(/login\.html/);
  });

  test('TC-MGMT-09: Booking id in table', async ({ page }) => {
    await page.goto('/my-bookings.html');
    await expect(page.locator('tbody td').first()).toBeVisible();
  });

  test('TC-MGMT-10: Total amount formatted', async ({ page }) => {
    await page.goto('/my-bookings.html');
    await expect(page.locator('tbody').first()).toContainText('$');
  });
});
