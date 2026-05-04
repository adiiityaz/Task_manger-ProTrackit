const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt.util');
const AppError = require('../utils/AppError');

/**
 * Creates a new user account.
 * Returns token + user shape matching the API contract.
 */
const signup = async ({ name, email, password, role }) => {
  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'MEMBER',
    },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signToken({ id: user.id, role: user.role });

  return { token, user };
};

/**
 * Authenticates a user with email/password.
 * Returns token + user shape matching the API contract.
 */
const login = async ({ email, password }) => {
  // Include password for comparison (select: false equivalent)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, password: true },
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Remove password before returning
  const { password: _pwd, ...safeUser } = user;
  const token = signToken({ id: safeUser.id, role: safeUser.role });

  return { token, user: safeUser };
};

/**
 * Fetches all users.
 */
const getUsers = async () => {
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
};

module.exports = { signup, login, getUsers };
