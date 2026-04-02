const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const updateRules = [
  body('full_name').optional().trim().isLength({ min: 2, max: 150 }),
  body('phone').optional().trim().isLength({ max: 32 }),
  body('current_password').optional().notEmpty(),
  body('new_password')
    .optional({ values: 'falsy' })
    .isLength({ min: 8 })
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .matches(/[^A-Za-z0-9]/),
];

async function getProfile(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateProfile(req, res) {
  const userId = req.user.id;
  const { full_name, phone, current_password, new_password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    const u = rows[0];
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'Current password required' });
      }
      const ok = await bcrypt.compare(current_password, u.password_hash);
      if (!ok) {
        return res.status(401).json({ success: false, message: 'Current password incorrect' });
      }
      const password_hash = await bcrypt.hash(new_password, 10);
      await pool.query('UPDATE users SET password_hash = ?, full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?', [
        password_hash,
        full_name ?? null,
        phone ?? null,
        userId,
      ]);
    } else {
      await pool.query('UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?', [
        full_name ?? null,
        phone ?? null,
        userId,
      ]);
    }
    const [out] = await pool.query(
      'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    return res.json({ success: true, data: out[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function history(req, res) {
  try {
    const userId = req.user.id;
    const [bookings] = await pool.query(
      `SELECT b.id, b.pickup_datetime, b.dropoff_datetime, b.status, b.total_amount, bk.brand, bk.model
       FROM bookings b JOIN bikes bk ON b.bike_id = bk.id WHERE b.user_id = ? ORDER BY b.created_at DESC`,
      [userId]
    );
    return res.json({ success: true, data: bookings });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { updateRules, getProfile, updateProfile, history };
