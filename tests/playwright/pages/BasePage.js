class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto(path) {
    // Some pages (e.g. auth-guarded) redirect immediately which can cause
    // Playwright to throw net::ERR_ABORTED when waiting for full "load".
    // domcontentloaded is enough for these app pages; individual tests assert the final URL/content.
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { BasePage };
