const express = require('express');
const p = require('../controllers/paymentController');
const { handleValidation } = require('../middleware/validate');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.post('/simulate', authMiddleware, p.payRules, handleValidation, p.simulate);

module.exports = router;
