/**
 * Central error handler. Must be registered last in Express middleware chain.
 * Handles Prisma errors, JWT errors, and generic server errors.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Prisma known request error (e.g., unique constraint violation)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({ message: `A record with this ${field} already exists.` });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired.' });
  }

  // Operational / known errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({ message: err.message });
  }

  // Fallback
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error.' : err.message,
  });
};

module.exports = errorHandler;
