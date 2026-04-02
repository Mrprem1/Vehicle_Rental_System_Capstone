const express = require('express');
const { registerRules, loginRules, register, login } = require('../controllers/authController');
const { handleValidation } = require('../middleware/validate');

const router = express.Router();
router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);

module.exports = router;
