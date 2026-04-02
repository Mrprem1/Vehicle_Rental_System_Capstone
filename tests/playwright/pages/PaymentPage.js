const { BasePage } = require('./BasePage');

class PaymentPage extends BasePage {
  constructor(page) {
    super(page);
    this.bookingId = page.getByTestId('pay-booking-id');
    this.card = page.getByTestId('pay-card');
    this.expiry = page.getByTestId('pay-expiry');
    this.cvv = page.getByTestId('pay-cvv');
    this.submit = page.getByTestId('pay-submit');
  }

  async open(bookingId) {
    await this.goto(bookingId ? `/payment.html?booking_id=${bookingId}` : '/payment.html');
  }

  async pay(bookingId, card, expiry, cvv) {
    await this.bookingId.fill(String(bookingId));
    await this.card.fill(card);
    await this.expiry.fill(expiry);
    await this.cvv.fill(cvv);
    await this.submit.click();
    await this.page.locator('.msg-success, .msg-error').first().waitFor({ state: 'visible' });
  }
}

module.exports = { PaymentPage };
