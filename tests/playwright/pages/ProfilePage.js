const { BasePage } = require('./BasePage');

class ProfilePage extends BasePage {
  constructor(page) {
    super(page);
    this.fullName = page.locator('#full_name');
    this.phone = page.locator('#phone');
    this.submit = page.locator('#form-prof button[type="submit"]');
    this.historyTable = page.locator('#hist');
  }

  async open() {
    await this.goto('/profile.html');
  }
}

module.exports = { ProfilePage };
