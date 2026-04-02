const { body, param, query } = require('express-validator');
const { pool } = require('../config/db');

const createRules = [
  body('bike_id').isInt({ min: 1 }),
  body('booking_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 2000 }),
];

const listRules = [query('bike_id').optional().isInt({ min: 1 })];

async function list(req, res) {
  try {
    const { bike_id } = req.query;
    let sql = `SELECT r.*, u.full_name as author_name FROM reviews r
      JOIN users u ON r.user_id = u.id WHERE 1=1`;
    const params = [];
    if (bike_id) {
      sql += ' AND r.bike_id = ?';
      params.push(bike_id);
    }
    sql += ' ORDER BY r.created_at DESC';
    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function create(req, res) {
  const userId = req.user.id;
  const { bike_id, booking_id, rating, comment } = req.body;
  try {
    const [bike] = await pool.query('SELECT id FROM bikes WHERE id = ?', [bike_id]);
    if (!bike.length) return res.status(404).json({ success: false, message: 'Bike not found' });

    if (booking_id) {
      const [bks] = await pool.query(
        'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND bike_id = ?',
        [booking_id, userId, bike_id]
      );
      if (!bks.length) {
        return res.status(400).json({ success: false, message: 'Invalid booking for review' });
      }
      if (bks[0].status !== 'completed' && bks[0].status !== 'confirmed') {
        return res.status(400).json({ success: false, message: 'Booking must be confirmed or completed' });
      }
    }

    const [ins] = await pool.query(
      'INSERT INTO reviews (user_id, bike_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [userId, bike_id, booking_id || null, rating, comment || null]
    );
    const [avg] = await pool.query(
      'SELECT AVG(rating) as a, COUNT(*) as c FROM reviews WHERE bike_id = ?',
      [bike_id]
    );
    await pool.query('UPDATE bikes SET rating_avg = ?, rating_count = ? WHERE id = ?', [
      Number(avg[0].a).toFixed(2),
      avg[0].c,
      bike_id,
    ]);
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [ins.insertId]);
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'You already reviewed this bike' });
    }
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { createRules, listRules, list, create };
