const { Router } = require('express');
const { body } = require('express-validator');
const { signup, login } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// ── POST /auth/signup ────────────────────────────────────────────────────────
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'MEMBER'])
      .withMessage('Role must be ADMIN or MEMBER.'),
  ],
  validate,
  signup
);

// ── POST /auth/login ─────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

module.exports = router;
