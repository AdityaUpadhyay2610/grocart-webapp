// server/src/middleware/verifyToken.js
// Checks that the request has a valid JWT access token in the Authorization header.
// If valid, sets req.user = { id, role } for downstream controllers to use.

const { verifyAccessToken } = require('../utils/tokens');
const { sendError } = require('../utils/response');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Expect "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access token is missing or malformed.', [], 401);
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const payload = verifyAccessToken(token);
    // Attach the user's id and role to the request object
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    // Token expired or tampered with
    return sendError(res, 'Access token is invalid or has expired.', [], 401);
  }
}

module.exports = verifyToken;
