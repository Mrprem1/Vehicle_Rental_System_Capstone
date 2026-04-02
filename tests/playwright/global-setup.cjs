const { execSync } = require('child_process');
const path = require('path');

module.exports = async function globalSetup() {
  const root = path.join(__dirname, '..', '..');
  try {
    execSync('node scripts/init-db.js', { cwd: root, stdio: 'inherit', env: process.env });
  } catch (e) {
    console.warn(
      '[global-setup] DB init failed — ensure MySQL is running and credentials in .env match. Tests may fail.'
    );
  }
};
