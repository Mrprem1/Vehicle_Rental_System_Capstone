const express = require('express');
const a = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/dashboard', authMiddleware, requireRole('admin'), a.dashboard);

module.exports = router;
