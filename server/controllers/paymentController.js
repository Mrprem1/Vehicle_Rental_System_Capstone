const { body } = require('express-validator');
const { pool } = require('../config/db');
const { luhnValid, expiryNotPast, shouldDecline } = require('../utils/payment');

const payRules = [
  body('booking_id').isInt({ min: 1 }),
  body('card_number').isString().trim(),
  body('expiry').matches(/^\d{4}$/).withMessage('Expiry MMYY'),
  body('cvv').matches(/^\d{3,4}$/).withMessage('Invalid CVV'),
  body('method').optional().isIn(['card', 'upi', 'wallet']),
];

async function simulate(req, res) {
  const userId = req.user.id;
  const { booking_id, card_number, expiry, cvv, method = 'card' } = req.body;
  try {
    const [books] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [booking_id, userId]
    );
    if (!books.length) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const booking = books[0];
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot pay for cancelled booking' });
    }
    const [existing] = await pool.query('SELECT id, status FROM payments WHERE booking_id = ?', [
      booking_id,
    ]);
    if (existing.length && existing[0].status === 'success') {
      return res.status(400).json({ success: false, message: 'Already paid' });
    }
    if (!luhnValid(card_number)) {
      return res.status(400).json({ success: false, message: 'Invalid card number' });
    }
    if (!expiryNotPast(expiry)) {
      return res.status(400).json({ success: false, message: 'Card expired' });
    }
    if (String(cvv).length < 3) {
      return res.status(400).json({ success: false, message: 'Invalid CVV' });
    }
    const digits = String(card_number).replace(/\D/g, '');
    const last4 = digits.slice(-4);
    const fail = shouldDecline(card_number);
    const status = fail ? 'failed' : 'success';
    const transaction_ref = `TXN-${Date.now()}-${booking_id}`;
    const failure_reason = fail ? 'Issuer declined (simulated test PAN)' : null;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (existing.length) {
        await conn.query(
          `UPDATE payments SET amount=?, status=?, method=?, transaction_ref=?, card_last4=?, failure_reason=?
           WHERE booking_id=?`,
          [
            booking.total_amount,
            status,
            method,
            transaction_ref,
            last4,
            failure_reason,
            booking_id,
          ]
        );
      } else {
        await conn.query(
          `INSERT INTO payments (booking_id, amount, status, method, transaction_ref, card_last4, failure_reason)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            booking_id,
            booking.total_amount,
            status,
            method,
            transaction_ref,
            last4,
            failure_reason,
          ]
        );
      }
      if (status === 'success') {
        await conn.query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', booking_id]);
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    return res.json({
      success: !fail,
      message: fail ? 'Payment failed' : 'Payment successful',
      data: { booking_id, status, transaction_ref, failure_reason },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { payRules, simulate };
