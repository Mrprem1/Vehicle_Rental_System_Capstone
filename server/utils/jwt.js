const jwt = require('jsonwebtoken');

function signPayload(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret_change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
}

module.exports = { signPayload, verifyToken };
