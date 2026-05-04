const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for the given user.
 * @param {object} payload - Must include { id, role }
 * @returns {string} signed token
 */
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { signToken };
