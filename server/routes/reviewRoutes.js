const express = require('express');
const r = require('../controllers/reviewController');
const { handleValidation } = require('../middleware/validate');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.get('/', r.listRules, handleValidation, r.list);
router.post('/', authMiddleware, r.createRules, handleValidation, r.create);

module.exports = router;
