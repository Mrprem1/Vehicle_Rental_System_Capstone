const express = require('express');
const p = require('../controllers/profileController');
const { handleValidation } = require('../middleware/validate');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.get('/', authMiddleware, p.getProfile);
router.put('/', authMiddleware, p.updateRules, handleValidation, p.updateProfile);
router.get('/history', authMiddleware, p.history);

module.exports = router;
