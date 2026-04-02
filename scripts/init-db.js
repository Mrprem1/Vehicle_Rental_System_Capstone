/**
 * Creates schema, seeds users (bcrypt), and bikes. Run: npm run db:init
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'bike_rental';

  const rootConn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await rootConn.query(schemaSql);
  await rootConn.end();

  const conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  const hash = await bcrypt.hash('Test@123', 10);
  await conn.query(
    `INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
     (?, ?, 'Admin User', '555-0001', 'admin'),
     (?, ?, 'Customer One', '555-0002', 'customer'),
     (?, ?, 'Customer Two', '555-0003', 'customer')
     ON DUPLICATE KEY UPDATE email=email`,
    ['admin@bike.local', hash, 'customer@bike.local', hash, 'customer2@bike.local', hash]
  );

  const [bikes] = await conn.query('SELECT COUNT(*) as c FROM bikes');
  if (bikes[0].c === 0) {
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await conn.query(seedSql);
  }

  await conn.end();
  console.log('Database initialized. Users: admin@bike.local, customer@bike.local, customer2@bike.local — password: Test@123');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
