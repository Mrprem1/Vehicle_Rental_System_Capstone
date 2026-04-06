const path = require('path');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: path.join(__dirname, 'tests', 'playwright', 'specs'),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
 reporter: [
    ['list'],
    ['html', { outputFolder: path.join(__dirname, 'reports/html-report'), open: 'never' }],
    ['allure-playwright', { resultsDir: path.join(__dirname, 'reports/allure-results') }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    browserName: 'chromium',
  },
  globalSetup: path.join(__dirname, 'tests', 'playwright', 'global-setup.cjs'),
  webServer: {
    command: 'node server/index.js',
    cwd: __dirname,
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
};
