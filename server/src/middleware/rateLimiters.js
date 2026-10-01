// server/src/middleware/rateLimiters.js
// Rate limiting to protect against brute-force attacks and abuse.

const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const { sendError } = require('../utils/response');

// Strict limiter for login and registration routes.
// Prevents brute-force password guessing.
const authLimiter = rateLimit({
  windowMs: config.security.authRateLimit.windowMinutes * 60 * 1000,
  max: config.security.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests. Please try again later.',
      [],
      429
    );
  }
});

// Refresh tokens rotate during session restoration, so allow more frequent requests
// without weakening the login and registration brute-force limit.
const refreshLimiter = rateLimit({
  windowMs: config.security.refreshRateLimit.windowMinutes * 60 * 1000,
  max: config.security.refreshRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many refresh requests. Please try again later.',
      [],
      429
    );
  }
});

// Generous limiter for everything else.
// Set high enough that retailers bulk-uploading products (one request per product) aren't blocked.
const generalLimiter = rateLimit({
  windowMs: config.security.generalRateLimit.windowMinutes * 60 * 1000,
  max: config.security.generalRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests. Please slow down.',
      [],
      429
    );
  }
});

module.exports = { authLimiter, refreshLimiter, generalLimiter };
