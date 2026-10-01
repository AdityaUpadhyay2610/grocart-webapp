// server/src/utils/response.js
// Standard response format helpers for consistent API responses.

/**
 * Send a standardized success response
 * @param {object} res - Express response object
 * @param {any} data - Response payload
 * @param {number} statusCode - HTTP status code (defaults to 200)
 */
function sendSuccess(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

/**
 * Send a standardized error response
 * @param {object} res - Express response object
 * @param {string} message - Human readable error message
 * @param {Array} errors - Optional array of field-level errors [{ field, message }]
 * @param {number} statusCode - HTTP status code (defaults to 500)
 */
function sendError(res, message = 'Something went wrong', errors = [], statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

module.exports = {
  sendSuccess,
  sendError
};
