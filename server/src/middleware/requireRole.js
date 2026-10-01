// server/src/middleware/requireRole.js
// Middleware factory that checks if the logged-in user has one of the allowed roles.
// Must be used AFTER verifyToken, which sets req.user.

const { sendError } = require('../utils/response');

/**
 * Returns a middleware that only allows users with the specified roles.
 * Usage: requireRole('admin') or requireRole('retailer', 'admin')
 */
function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return sendError(res, 'Not authenticated.', [], 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to perform this action.', [], 403);
    }

    next();
  };
}

module.exports = requireRole;
