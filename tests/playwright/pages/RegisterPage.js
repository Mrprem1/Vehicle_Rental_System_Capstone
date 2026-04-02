const { BasePage } = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.name = page.getByTestId('reg-name');
    this.email = page.getByTestId('reg-email');
    this.password = page.getByTestId('reg-password');
    this.submit = page.getByTestId('reg-submit');
  }

  async register(fullName, email, password) {
    await this.goto('/register.html');
    await this.name.fill(fullName);
    await this.email.fill(email);
    await this.password.fill(password);
    await Promise.all([
      this.page.waitForURL(/bikes\.html/i, { waitUntil: 'domcontentloaded' }),
      this.submit.click(),
    ]);
  }

  async registerExpectError(fullName, email, password) {
    await this.goto('/register.html');
    await this.name.fill(fullName);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
    await this.page.locator('.msg-error').first().waitFor({ state: 'visible' });
  }
}

module.exports = { RegisterPage };
