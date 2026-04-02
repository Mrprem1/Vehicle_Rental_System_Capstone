const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { BookingPage } = require('../pages/BookingPage');
const { PaymentPage } = require('../pages/PaymentPage');
const { localDateTime, futureExpiryMMYY } = require('../utils/dates');
const data = require('../fixtures/test-data.json');

test.describe('Module: Payment simulation', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(data.customer.email, data.customer.password);
  });

  test('TC-PAY-01: Payment page loads', async ({ page }) => {
    const pay = new PaymentPage(page);
    await pay.open();
    await expect(pay.card).toBeVisible();
  });

  test('TC-PAY-02: Successful payment flow', async ({ page }, testInfo) => {
    const day = 200 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('3');
    await booking.fillBooking(3, localDateTime(day, 9), localDateTime(day, 11));
    await booking.submit.click();
    const text = await page.locator('.msg-success').innerText();
    const m = text.match(/#(\d+)/);
    expect(m).toBeTruthy();
    const id = m[1];
    const pay = new PaymentPage(page);
    await pay.open(id);
    const exp = futureExpiryMMYY();
    await pay.pay(id, data.validCard, exp, '123');
    await expect(page.locator('.msg-success')).toContainText(/successful/i);
  });

  test('TC-PAY-03: Declined card', async ({ page }, testInfo) => {
    const day = 220 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('4');
    await booking.fillBooking(4, localDateTime(day, 8), localDateTime(day, 10));
    await booking.submit.click();
    const text = await page.locator('.msg-success').innerText();
    const id = text.match(/#(\d+)/)[1];
    const pay = new PaymentPage(page);
    await pay.open(id);
    await pay.pay(id, data.declineCard, futureExpiryMMYY(), '123');
    await expect(page.locator('.msg-error, .msg-success')).toContainText(/fail|declined/i);
  });

  test('TC-PAY-04: Invalid card number', async ({ page }, testInfo) => {
    const day = 240 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('5');
    await booking.fillBooking(5, localDateTime(day, 12), localDateTime(day, 14));
    await booking.submit.click();
    const id = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    const pay = new PaymentPage(page);
    await pay.open(id);
    await pay.pay(id, data.invalidCard, futureExpiryMMYY(), '123');
    await expect(page.locator('.msg-error')).toContainText(/Invalid card/i);
  });

  test('TC-PAY-05: Expired card rejected', async ({ page }, testInfo) => {
    const day = 260 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('2');
    await booking.fillBooking(2, localDateTime(day, 9), localDateTime(day, 11));
    await booking.submit.click();
    const id = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    const pay = new PaymentPage(page);
    await pay.open(id);
    await pay.pay(id, data.validCard, '0100', '123');
    await expect(page.locator('.msg-error')).toContainText(/expired/i);
  });

  test('TC-PAY-06: Guest cannot pay', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/payment.html');
    await expect(page).toHaveURL(/login\.html/);
  });

  test('TC-PAY-07: Booking id query param prefills', async ({ page }, testInfo) => {
    const day = 280 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('3');
    await booking.fillBooking(3, localDateTime(day, 10), localDateTime(day, 12));
    await booking.submit.click();
    const id = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    await page.goto(`/payment.html?booking_id=${id}`);
    await expect(page.getByTestId('pay-booking-id')).toHaveValue(id);
  });

  test('TC-PAY-08: CVV too short', async ({ page }, testInfo) => {
    const day = 300 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('4');
    await booking.fillBooking(4, localDateTime(day, 13), localDateTime(day, 15));
    await booking.submit.click();
    const id = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    await page.goto('/payment.html');
    await page.getByTestId('pay-booking-id').fill(id);
    await page.getByTestId('pay-card').fill(data.validCard);
    await page.getByTestId('pay-expiry').fill(futureExpiryMMYY());
    await page.getByTestId('pay-cvv').fill('12');
    await page.getByTestId('pay-submit').click();
    await expect(page.locator('.msg-error')).toContainText(/CVV|Invalid/i);
  });

  test('TC-PAY-09: Payment form labels', async ({ page }) => {
    await page.goto('/payment.html');
    await expect(page.getByLabel(/Card number/i)).toBeVisible();
  });

  test('TC-PAY-10: Retry after decline possible', async ({ page }, testInfo) => {
    const day = 320 + testInfo.workerIndex;
    const booking = new BookingPage(page);
    await booking.open('5');
    await booking.fillBooking(5, localDateTime(day, 9), localDateTime(day, 10));
    await booking.submit.click();
    const id = (await page.locator('.msg-success').innerText()).match(/#(\d+)/)[1];
    const pay = new PaymentPage(page);
    await pay.open(id);
    await pay.pay(id, data.declineCard, futureExpiryMMYY(), '123');
    await pay.pay(id, data.validCard, futureExpiryMMYY(), '123');
    await expect(page.locator('.msg-success').last()).toContainText(/successful/i);
  });
});
