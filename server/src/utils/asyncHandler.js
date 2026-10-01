// server/src/utils/asyncHandler.js
// Wraps async route handlers to catch exceptions and forward them to the error middleware.

/**
 * @param {Function} fn - Async controller function
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
