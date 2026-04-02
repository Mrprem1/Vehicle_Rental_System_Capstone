const { BasePage } = require('./BasePage');

class AdminPage extends BasePage {
  constructor(page) {
    super(page);
    this.stats = page.locator('#stats');
    this.formBike = page.locator('#form-bike');
  }

  async open() {
    await this.goto('/admin.html');
  }
}

module.exports = { AdminPage };
