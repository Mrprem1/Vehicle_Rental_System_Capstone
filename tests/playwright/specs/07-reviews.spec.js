const { test, expect } = require('@playwright/test');
const { RegisterPage } = require('../pages/RegisterPage');
const { BookingPage } = require('../pages/BookingPage');
const { PaymentPage } = require('../pages/PaymentPage');
const { LoginPage } = require('../pages/LoginPage');
const { localDateTime, futureExpiryMMYY } = require('../utils/dates');
const data = require('../fixtures/test-data.json');

async function login(page, email, password) {
  const login = new LoginPage(page);
  await login.login(email, password);
}

test.describe('Module: Ratings & reviews', () => {
  test('TC-REV-01: Reviews list on bike detail', async ({ page }) => {
    await login(page, data.customer.email, data.customer.password);
    await page.goto('/bike-detail.html?id=1');
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
  });

  test('TC-REV-02: Submit review after booking flow', async ({ page }) => {
    const email = `rev_${Date.now()}@test.local`;
    const reg = new RegisterPage(page);
    await reg.register('Reviewer', email, 'Str0ng!Pass');
    const day = 400;
    const booking = new BookingPage(page);
    await booking.open('2');
    await booking.fillBooking(2, localDateTime(day, 10), localDateTime(day, 12));
    await booking.submit.click();
    const id = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    const pay = new PaymentPage(page);
    await pay.open(id);
    await pay.pay(id, data.validCard, futureExpiryMMYY(), '123');
    await page.goto(`/bike-detail.html?id=2`);
    await page.locator('#rv-booking').fill(id);
    await page.locator('#rv-comment').fill('Great ride!');
    await page.locator('#form-review').locator('button[type="submit"]').click();
    await expect(page.locator('.msg-success')).toContainText('Review');
  });

  test('TC-REV-03: Guest redirected when submitting review', async ({ page }) => {
    await page.goto('/bike-detail.html?id=1');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('#form-review').locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/login\.html/);
  });

  test('TC-REV-04: Rating select defaults', async ({ page }) => {
    await login(page, data.customer.email, data.customer.password);
    await page.goto('/bike-detail.html?id=3');
    await expect(page.locator('#rv-rating')).toHaveValue('5');
  });

  test('TC-REV-05: Review form visible', async ({ page }) => {
    await login(page, data.customer.email, data.customer.password);
    await page.goto('/bike-detail.html?id=4');
    await expect(page.locator('#form-review')).toBeVisible();
  });

  test('TC-REV-06: Duplicate review blocked', async ({ page }) => {
    const email = `rev2_${Date.now()}@test.local`;
    const reg = new RegisterPage(page);
    await reg.register('DupRev', email, 'Str0ng!Pass');
    const day = 420;
    const booking = new BookingPage(page);
    await booking.open('3');
    await booking.fillBooking(3, localDateTime(day, 9), localDateTime(day, 11));
    await booking.submit.click();
    const bid = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    const pay = new PaymentPage(page);
    await pay.open(bid);
    await pay.pay(bid, data.validCard, futureExpiryMMYY(), '123');
    await page.goto('/bike-detail.html?id=3');
    await page.locator('#rv-comment').fill('First');
    await page.locator('#form-review').locator('button[type="submit"]').click();
    await page.locator('#rv-comment').fill('Second');
    await page.locator('#form-review').locator('button[type="submit"]').click();
    await expect(page.locator('.msg-error')).toContainText(/already reviewed/i);
  });

  test('TC-REV-07: Review list container renders', async ({ page }) => {
    await login(page, data.customer.email, data.customer.password);
    await page.goto('/bike-detail.html?id=1');
    await expect(page.locator('#reviews')).toBeAttached();
  });

  test('TC-REV-08: Low rating selectable', async ({ page }) => {
    await login(page, data.customer.email, data.customer.password);
    await page.goto('/bike-detail.html?id=5');
    await page.locator('#rv-rating').selectOption('2');
    await expect(page.locator('#rv-rating')).toHaveValue('2');
  });

  test('TC-REV-09: Long comment accepted', async ({ page }) => {
    const email = `rev3_${Date.now()}@test.local`;
    const reg = new RegisterPage(page);
    await reg.register('Long', email, 'Str0ng!Pass');
    const day = 440;
    const booking = new BookingPage(page);
    await booking.open('4');
    await booking.fillBooking(4, localDateTime(day, 8), localDateTime(day, 9));
    await booking.submit.click();
    const bid = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    const pay = new PaymentPage(page);
    await pay.open(bid);
    await pay.pay(bid, data.validCard, futureExpiryMMYY(), '123');
    await page.goto('/bike-detail.html?id=4');
    await page.locator('#rv-comment').fill('a'.repeat(500));
    await page.locator('#form-review').locator('button[type="submit"]').click();
    await expect(page.locator('.msg-success')).toBeVisible();
  });

  test('TC-REV-10: Bike average rating in specs', async ({ page }) => {
    await login(page, data.customer.email, data.customer.password);
    await page.goto('/bike-detail.html?id=1');
    await expect(page.locator('.detail-specs')).toContainText('Rating');
  });

  test('TC-REV-11: Reviews section after list', async ({ page }) => {
    await login(page, data.customer.email, data.customer.password);
    await page.goto('/bike-detail.html?id=2');
    await expect(page.locator('#reviews')).toBeVisible();
  });

  test('TC-REV-12: Empty comment allowed', async ({ page }) => {
    const email = `rev4_${Date.now()}@test.local`;
    const reg = new RegisterPage(page);
    await reg.register('NoComment', email, 'Str0ng!Pass');
    const day = 460;
    const booking = new BookingPage(page);
    await booking.open('5');
    await booking.fillBooking(5, localDateTime(day, 14), localDateTime(day, 15));
    await booking.submit.click();
    const bid = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    const pay = new PaymentPage(page);
    await pay.open(bid);
    await pay.pay(bid, data.validCard, futureExpiryMMYY(), '123');
    await page.goto('/bike-detail.html?id=5');
    await page.locator('#form-review').locator('button[type="submit"]').click();
    await expect(page.locator('.msg-success')).toBeVisible();
  });
});
