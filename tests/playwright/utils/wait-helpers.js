/**
 * @param {import('@playwright/test').Page} page
 * @param {string} urlPart
 */
async function waitForUrl(page, urlPart) {
  await page.waitForURL((u) => u.pathname.includes(urlPart) || u.href.includes(urlPart), {
    timeout: 15_000,
  });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function networkIdle(page) {
  await page.waitForLoadState('domcontentloaded');
}

module.exports = { waitForUrl, networkIdle };
