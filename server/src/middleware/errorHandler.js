// server/src/middleware/errorHandler.js
// Central error handling middleware.
// Catches all uncaught exceptions, logs details server-side, and returns safe responses to clients.

const config = require('../config/config');
const { sendError } = require('../utils/response');

// Express identifies error middleware by 4 arguments: (err, req, res, next)
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Always log full error details on the server
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // If response is already being streamed/sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  
  // Provide human-friendly messages for common error types
  let message = err.message || 'Something went wrong';
  if (statusCode === 500 && config.isProduction) {
    message = 'Something went wrong on the server';
  }

  const errors = err.errors || [];
  return sendError(res, message, errors, statusCode);
}

module.exports = errorHandler;
