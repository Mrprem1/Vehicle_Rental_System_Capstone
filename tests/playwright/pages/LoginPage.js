const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.email = page.getByTestId('login-email');
    this.password = page.getByTestId('login-password');
    this.submit = page.getByTestId('login-submit');
  }

  async login(email, password) {
    await this.goto('/login.html');
    await this.email.fill(email);
    await this.password.fill(password);
    await Promise.all([
      this.page.waitForURL(/bikes\.html/i, { waitUntil: 'domcontentloaded' }),
      this.submit.click(),
    ]);
  }
}

module.exports = { LoginPage };
