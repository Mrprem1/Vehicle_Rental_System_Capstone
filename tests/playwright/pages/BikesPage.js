const { BasePage } = require('./BasePage');

class BikesPage extends BasePage {
  constructor(page) {
    super(page);
    this.grid = page.getByTestId('bike-grid');
    this.applyFilters = page.getByTestId('filter-apply');
    this.search = page.locator('#f-search');
    this.type = page.locator('#f-type');
    this.brand = page.locator('#f-brand');
    this.minPrice = page.locator('#f-min');
    this.maxPrice = page.locator('#f-max');
    this.availableOnly = page.locator('#f-avail');
  }

  async open() {
    await this.goto('/bikes.html');
  }

  async apply() {
    await this.applyFilters.click();
  }

  cardByText(text) {
    return this.page.locator('.bike-card', { hasText: text });
  }
}

module.exports = { BikesPage };
