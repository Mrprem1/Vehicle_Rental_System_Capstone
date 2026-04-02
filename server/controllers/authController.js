const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { pool } = require('../config/db');
const { signPayload } = require('../utils/jwt');

const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password min 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password needs uppercase')
    .matches(/[a-z]/)
    .withMessage('Password needs lowercase')
    .matches(/[0-9]/)
    .withMessage('Password needs digit')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password needs special character'),
  body('full_name').trim().isLength({ min: 2, max: 150 }).withMessage('Name 2-150 chars'),
  body('phone').optional().trim().isLength({ max: 32 }),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Invalid role'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

async function register(req, res) {
  const { email, password, full_name, phone, role } = req.body;
  const effectiveRole = role === 'admin' ? 'customer' : role || 'customer';
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, password_hash, full_name, phone || null, effectiveRole]
    );
    const token = signPayload({ sub: r.insertId, email, role: effectiveRole });
    return res.status(201).json({
      success: true,
      message: 'Registered',
      token,
      user: { id: r.insertId, email, full_name, role: effectiveRole },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signPayload({ sub: u.id, email: u.email, role: u.role });
    return res.json({
      success: true,
      token,
      user: { id: u.id, email: u.email, full_name: u.full_name, role: u.role },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { registerRules, loginRules, register, login };
