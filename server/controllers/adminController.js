const { pool } = require('../config/db');

async function dashboard(req, res) {
  try {
    const [[userCount]] = await pool.query('SELECT COUNT(*) as c FROM users WHERE role = ?', ['customer']);
    const [[bikeCount]] = await pool.query('SELECT COUNT(*) as c FROM bikes');
    const [[bookingCount]] = await pool.query('SELECT COUNT(*) as c FROM bookings');
    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(b.total_amount),0) as total FROM bookings b
       JOIN payments p ON p.booking_id = b.id WHERE p.status = 'success'`
    );
    const [recent] = await pool.query(
      `SELECT b.id, b.status, b.total_amount, b.pickup_datetime, bk.brand, bk.model, u.email
       FROM bookings b
       JOIN bikes bk ON b.bike_id = bk.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC LIMIT 10`
    );
    const [byStatus] = await pool.query(
      'SELECT status, COUNT(*) as c FROM bookings GROUP BY status'
    );
    return res.json({
      success: true,
      data: {
        users: userCount.c,
        bikes: bikeCount.c,
        bookings: bookingCount.c,
        revenue: Number(revenue.total),
        recent_bookings: recent,
        bookings_by_status: byStatus,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { dashboard };
