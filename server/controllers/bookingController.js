const { body, param, query } = require('express-validator');
const { pool } = require('../config/db');
const { intervalsOverlap } = require('../utils/booking');

function formatDateTime(isoStr) {
  return new Date(isoStr).toISOString().slice(0, 19).replace('T', ' ');
}

const createRules = [
  body('bike_id').isInt({ min: 1 }),
  body('pickup_datetime').isISO8601(),
  body('dropoff_datetime').isISO8601(),
  body('notes').optional().trim().isLength({ max: 500 }),
];

const updateRules = [
  param('id').isInt({ min: 1 }),
  body('pickup_datetime').optional().isISO8601(),
  body('dropoff_datetime').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
  body('notes').optional().trim().isLength({ max: 500 }),
];

const listRules = [query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed'])];

function hoursBetween(pickup, dropoff) {
  const ms = new Date(dropoff) - new Date(pickup);
  return ms / (1000 * 60 * 60);
}

async function assertNoOverlap(conn, bikeId, pickup, dropoff, excludeBookingId = null) {
  let sql = `SELECT id, pickup_datetime, dropoff_datetime FROM bookings
    WHERE bike_id = ? AND status IN ('pending','confirmed')
    AND NOT (dropoff_datetime <= ? OR pickup_datetime >= ?)`;
  const params = [bikeId, pickup, dropoff];
  if (excludeBookingId) {
    sql += ' AND id <> ?';
    params.push(excludeBookingId);
  }
  const [conflicts] = await conn.query(sql, params);
  return conflicts;
}

async function assertNotInMaintenance(conn, bikeId, pickup, dropoff) {
  const [slots] = await conn.query(
    `SELECT id FROM availability_slots WHERE bike_id = ?
     AND NOT (end_datetime <= ? OR start_datetime >= ?)`,
    [bikeId, pickup, dropoff]
  );
  return slots;
}

async function create(req, res) {
  const userId = req.user.id;
const { bike_id, pickup_datetime, dropoff_datetime, notes } = req.body;
  const pickupMySQL = formatDateTime(pickup_datetime);
  const dropoffMySQL = formatDateTime(dropoff_datetime);
  const pickup = new Date(pickup_datetime);
  const dropoff = new Date(dropoff_datetime);
  if (pickup >= dropoff) {
    return res.status(400).json({ success: false, message: 'Drop-off must be after pick-up' });
  }
  const now = new Date();
  if (pickup < now) {
    return res.status(400).json({ success: false, message: 'Pick-up cannot be in the past' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [bikes] = await conn.query(
      'SELECT id, price_per_day, stock, is_available FROM bikes WHERE id = ? FOR UPDATE',
      [bike_id]
    );
    if (!bikes.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Bike not found' });
    }
    const bike = bikes[0];
    if (!bike.is_available || bike.stock < 1) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Bike not available for booking' });
    }
    const maint = await assertNotInMaintenance(conn, bike_id, pickup_datetime, dropoff_datetime);
    if (maint.length) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Bike is blocked for maintenance in this period' });
    }
    const conflicts = await assertNoOverlap(conn, bike_id, pickup_datetime, dropoff_datetime);
    if (conflicts.length) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Overlapping booking exists for this bike' });
    }
    const hrs = hoursBetween(pickup_datetime, dropoff_datetime);
    const days = Math.max(1, Math.ceil(hrs / 24));
    const total_amount = (Number(bike.price_per_day) * days).toFixed(2);
    const [ins] = await conn.query(
      `INSERT INTO bookings (user_id, bike_id, pickup_datetime, dropoff_datetime, status, total_amount, notes)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [userId, bike_id, pickupMySQL, dropoffMySQL, total_amount, notes || null]
    );
    await conn.commit();
    const [rows] = await pool.query(
      `SELECT b.*, bk.brand, bk.model, bk.image_url FROM bookings b JOIN bikes bk ON b.bike_id = bk.id WHERE b.id = ?`,
      [ins.insertId]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
}

async function listMine(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    let sql = `SELECT b.*, bk.brand, bk.model, bk.image_url, bk.type
      FROM bookings b JOIN bikes bk ON b.bike_id = bk.id WHERE b.user_id = ?`;
    const params = [userId];
    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY b.pickup_datetime DESC';
    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function listAll(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, bk.brand, bk.model, u.email as user_email, u.full_name as user_name
       FROM bookings b
       JOIN bikes bk ON b.bike_id = bk.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateBooking(req, res) {
  const userId = req.user.id;
  const bookingId = req.params.id;
  const role = req.user.role;
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Booking not found' });
    const booking = rows[0];
    if (role !== 'admin' && booking.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (req.body.status === 'completed' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can mark booking completed' });
    }
  let pickup = formatDateTime(booking.pickup_datetime);
  let dropoff = formatDateTime(booking.dropoff_datetime);
  if (req.body.pickup_datetime) pickup = formatDateTime(req.body.pickup_datetime);
  if (req.body.dropoff_datetime) dropoff = formatDateTime(req.body.dropoff_datetime);
    if (new Date(pickup) >= new Date(dropoff)) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }
    if (req.body.status === 'cancelled' || req.body.status) {
      const st = req.body.status || booking.status;
      if (st === 'cancelled' && booking.status === 'completed') {
        return res.status(400).json({ success: false, message: 'Cannot cancel completed booking' });
      }
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [bikes] = await conn.query('SELECT price_per_day FROM bikes WHERE id = ?', [booking.bike_id]);
      if (
        req.body.pickup_datetime ||
        req.body.dropoff_datetime ||
        req.body.status === 'cancelled'
      ) {
        if (req.body.status !== 'cancelled') {
          const maint = await assertNotInMaintenance(conn, booking.bike_id, pickup, dropoff);
          if (maint.length && req.body.status !== 'cancelled') {
            await conn.rollback();
            return res.status(409).json({ success: false, message: 'Maintenance conflict' });
          }
          const conflicts = await assertNoOverlap(conn, booking.bike_id, pickup, dropoff, bookingId);
          if (conflicts.length) {
            await conn.rollback();
            return res.status(409).json({ success: false, message: 'Overlapping booking' });
          }
        }
      }
      let total_amount = booking.total_amount;
      if (req.body.pickup_datetime || req.body.dropoff_datetime) {
        const hrs = hoursBetween(pickup, dropoff);
        const days = Math.max(1, Math.ceil(hrs / 24));
        total_amount = (Number(bikes[0].price_per_day) * days).toFixed(2);
      }
      const nextStatus = req.body.status ?? booking.status;
      await conn.query(
        `UPDATE bookings SET pickup_datetime=?, dropoff_datetime=?, status=?, total_amount=?, notes=COALESCE(?, notes) WHERE id=?`,
        [pickup, dropoff, nextStatus, total_amount, req.body.notes ?? null, bookingId]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    const [out] = await pool.query(
      `SELECT b.*, bk.brand, bk.model FROM bookings b JOIN bikes bk ON b.bike_id = bk.id WHERE b.id = ?`,
      [bookingId]
    );
    return res.json({ success: true, data: out[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  createRules,
  updateRules,
  listRules,
  create,
  listMine,
  listAll,
  updateBooking,
};
