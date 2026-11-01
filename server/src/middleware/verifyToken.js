// Checks that the request has a valid JWT access token in the Authorization header.
// If valid, sets req.user = { id, role } for downstream controllers to use.

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { sendError } = require('../utils/response');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Expect "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access token is missing or malformed.', [], 401);
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const payload = jwt.verify(
      token,
      config.jwt.accessSecret,
      config.jwt.verifyOptions
    );
    // Attach the user's id and role to the request object
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    // Token expired or tampered with
    return sendError(res, 'Access token is invalid or has expired.', [], 401);
  }
}

module.exports = verifyToken;
