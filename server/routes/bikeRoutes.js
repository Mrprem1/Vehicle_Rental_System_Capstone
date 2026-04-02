const express = require('express');
const bike = require('../controllers/bikeController');
const { handleValidation } = require('../middleware/validate');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', bike.listRules, handleValidation, bike.list);
router.get('/:id', bike.idRule, handleValidation, bike.getById);
router.post('/', authMiddleware, requireRole('admin'), bike.createRules, handleValidation, bike.create);
router.put('/:id', authMiddleware, requireRole('admin'), bike.updateRules, handleValidation, bike.update);
router.delete('/:id', authMiddleware, requireRole('admin'), bike.idRule, handleValidation, bike.remove);

module.exports = router;
