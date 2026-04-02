const express = require('express');
const b = require('../controllers/bookingController');
const { handleValidation } = require('../middleware/validate');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, b.listRules, handleValidation, b.listMine);
router.get('/all', authMiddleware, requireRole('admin'), b.listAll);
router.post('/', authMiddleware, b.createRules, handleValidation, b.create);
router.patch('/:id', authMiddleware, b.updateRules, handleValidation, b.updateBooking);

module.exports = router;
