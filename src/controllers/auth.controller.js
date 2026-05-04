const authService = require('../services/auth.service');

/**
 * POST /auth/signup
 * Body: { name, email, password, role? }
 * Response: { token, user: { id, name, email, role } }
 */
const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/login
 * Body: { email, password }
 * Response: { token, user: { id, name, email, role } }
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /auth/users
 * Response: [{ id, name, email, role }]
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await authService.getUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getUsers };
