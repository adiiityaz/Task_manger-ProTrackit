/**
 * Creates a standardised operational error with an HTTP status code.
 * Errors with isOperational=true are handled gracefully in the central error handler.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
