const { validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arr = errors.array();
    const first = arr[0];
    return res.status(400).json({
      success: false,
      message: first?.msg || 'Validation failed',
      errors: arr.map((e) => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
}

module.exports = { handleValidation };
