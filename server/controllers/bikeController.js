const { body, query, param } = require('express-validator');
const { pool } = require('../config/db');

const listRules = [
  query('type').optional().isIn(['road', 'mountain', 'city', 'electric', 'hybrid']),
  query('brand').optional().trim(),
  query('min_price').optional().isFloat({ min: 0 }),
  query('max_price').optional().isFloat({ min: 0 }),
  query('available_only').optional().isIn(['0', '1', 'true', 'false']),
  query('search').optional().trim(),
];

const idRule = [param('id').isInt({ min: 1 })];

const createRules = [
  body('brand').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('type').isIn(['road', 'mountain', 'city', 'electric', 'hybrid']),
  body('price_per_day').isFloat({ gt: 0 }),
  body('description').optional().trim(),
  body('image_url').isURL({ require_protocol: true }),
  body('stock').optional().isInt({ min: 0 }),
  body('is_available').optional().isBoolean(),
];

const updateRules = [
  param('id').isInt({ min: 1 }),
  body('brand').optional().trim().notEmpty(),
  body('model').optional().trim().notEmpty(),
  body('type').optional().isIn(['road', 'mountain', 'city', 'electric', 'hybrid']),
  body('price_per_day').optional().isFloat({ gt: 0 }),
  body('description').optional().trim(),
  body('image_url').optional().isURL({ require_protocol: true }),
  body('stock').optional().isInt({ min: 0 }),
  body('is_available').optional().isBoolean(),
];

async function list(req, res) {
  try {
    const {
      type,
      brand,
      min_price: minPrice,
      max_price: maxPrice,
      available_only: avail,
      search,
    } = req.query;
    let sql = 'SELECT * FROM bikes WHERE 1=1';
    const params = [];
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (brand) {
      sql += ' AND brand LIKE ?';
      params.push(`%${brand}%`);
    }
    if (minPrice !== undefined) {
      sql += ' AND price_per_day >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined) {
      sql += ' AND price_per_day <= ?';
      params.push(Number(maxPrice));
    }
    if (avail === '1' || avail === 'true') {
      sql += ' AND is_available = 1 AND stock > 0';
    }
    if (search) {
      sql += ' AND (brand LIKE ? OR model LIKE ? OR description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    sql += ' ORDER BY id ASC';
    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getById(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM bikes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Bike not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function create(req, res) {
  try {
    const {
      brand,
      model,
      type,
      price_per_day,
      description,
      image_url,
      stock = 1,
      is_available = true,
    } = req.body;
    const [r] = await pool.query(
      `INSERT INTO bikes (brand, model, type, price_per_day, description, image_url, stock, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [brand, model, type, price_per_day, description || '', image_url, stock, is_available ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM bikes WHERE id = ?', [r.insertId]);
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const [existing] = await pool.query('SELECT * FROM bikes WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Bike not found' });
    const cur = existing[0];
    const next = {
      brand: req.body.brand ?? cur.brand,
      model: req.body.model ?? cur.model,
      type: req.body.type ?? cur.type,
      price_per_day: req.body.price_per_day ?? cur.price_per_day,
      description: req.body.description ?? cur.description,
      image_url: req.body.image_url ?? cur.image_url,
      stock: req.body.stock ?? cur.stock,
      is_available:
        req.body.is_available !== undefined ? (req.body.is_available ? 1 : 0) : cur.is_available,
    };
    await pool.query(
      `UPDATE bikes SET brand=?, model=?, type=?, price_per_day=?, description=?, image_url=?, stock=?, is_available=? WHERE id=?`,
      [
        next.brand,
        next.model,
        next.type,
        next.price_per_day,
        next.description,
        next.image_url,
        next.stock,
        next.is_available,
        id,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM bikes WHERE id = ?', [id]);
    return res.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function remove(req, res) {
  try {
    const [r] = await pool.query('DELETE FROM bikes WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Bike not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  listRules,
  idRule,
  createRules,
  updateRules,
  list,
  getById,
  create,
  update,
  remove,
};
