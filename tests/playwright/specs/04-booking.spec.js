const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { BookingPage } = require('../pages/BookingPage');
const { localDateTime } = require('../utils/dates');
const data = require('../fixtures/test-data.json');

test.describe('Module: Booking', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-BOOK-01: Booking page requires auth', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/booking.html');
    await expect(page).toHaveURL(/login\.html/);
  });

  test('TC-BOOK-02: Create booking happy path', async ({ page }, testInfo) => {
    const offset = 5 + testInfo.workerIndex * 4;
    const pickup = localDateTime(offset, 10);
    const dropoff = localDateTime(offset, 16);
    const booking = new BookingPage(page);
    await booking.open('3');
    await booking.fillBooking(3, pickup, dropoff);
    await booking.submit.click();
    await expect(page.locator('.msg-success')).toContainText('Booking #');
  });

  test('TC-BOOK-03: Drop-off before pick-up shows error', async ({ page }) => {
    const booking = new BookingPage(page);
    await booking.open('2');
    const pickup = localDateTime(20, 14);
    const dropoff = localDateTime(20, 10);
    await booking.fillBooking(2, pickup, dropoff);
    await booking.submit.click();
    await expect(page.locator('.msg-error')).toBeVisible();
  });

  test('TC-BOOK-04: Past pick-up rejected', async ({ page }) => {
    const booking = new BookingPage(page);
    await booking.open('2');
    await booking.bikeId.fill('2');
    const past = new Date();
    past.setDate(past.getDate() - 2);
    const p = (n) => String(n).padStart(2, '0');
    const pastStr = `${past.getFullYear()}-${p(past.getMonth() + 1)}-${p(past.getDate())}T10:00`;
    const fut = localDateTime(25, 18);
    await booking.pickup.fill(pastStr);
    await booking.dropoff.fill(fut);
    await booking.submit.click();
    await expect(page.locator('.msg-error')).toContainText('past');
  });

  test('TC-BOOK-05: Overlap booking rejected', async ({ page }, testInfo) => {
    const day = 40 + testInfo.workerIndex;
    const pickup = localDateTime(day, 9);
    const dropoff = localDateTime(day, 17);
    const booking = new BookingPage(page);
    await booking.open('1');
    await booking.fillBooking(1, pickup, dropoff);
    await booking.submit.click();
    await expect(page.locator('.msg-success')).toBeVisible();
    await booking.open('1');
    await booking.fillBooking(1, pickup, dropoff);
    await booking.submit.click();
    await expect(page.locator('.msg-error')).toContainText('Overlapping');
  });

  test('TC-BOOK-06: Calendar inputs visible', async ({ page }) => {
    const booking = new BookingPage(page);
    await booking.open('4');
    await expect(booking.pickup).toBeVisible();
    await expect(booking.dropoff).toBeVisible();
  });

  test('TC-BOOK-07: Notes optional', async ({ page }, testInfo) => {
    const day = 60 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('5');
    await booking.fillBooking(5, localDateTime(day, 11), localDateTime(day, 15));
    await page.locator('#notes').fill('Please include helmet');
    await booking.submit.click();
    await expect(page.locator('.msg-success')).toBeVisible();
  });

  test('TC-BOOK-08: Unknown bike id from API', async ({ page }) => {
    const booking = new BookingPage(page);
    await booking.open();
    await booking.fillBooking(99999, localDateTime(70, 10), localDateTime(70, 12));
    await booking.submit.click();
    await expect(page.locator('.msg-error')).toBeVisible();
  });

  test('TC-BOOK-09: Booking link from detail prefills bike', async ({ page }) => {
    await page.goto('/bike-detail.html?id=4');
    await page.getByRole('link', { name: 'Book this bike' }).click();
    await expect(page.getByTestId('book-bike-id')).toHaveValue('4');
  });

  test('TC-BOOK-10: Long rental window calculates amount', async ({ page }, testInfo) => {
    const day = 80 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('3');
    await booking.fillBooking(
      3,
      localDateTime(day, 8),
      localDateTime(day + 3, 8)
    );
    await booking.submit.click();
    await expect(page.locator('.msg-success')).toContainText('Booking #');
  });
});
