// server/src/utils/tokens.js
// Helpers for creating and verifying JWTs, and hashing refresh tokens.

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');

/**
 * Create a short-lived access token (15 minutes).
 * Payload contains userId and role so we can authorize without a DB lookup.
 */
function createAccessToken(userId, role) {
  return jwt.sign(
    { sub: userId, role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpires }
  );
}

/**
 * Create a long-lived refresh token (7 days).
 * Contains a random jti so each token is unique and can be revoked individually.
 */
function createRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, jti: crypto.randomUUID() },
    config.jwt.refreshSecret,
    { expiresIn: `${config.jwt.refreshExpiresDays}d` }
  );
}

/**
 * Verify an access token. Returns the payload or throws an error.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

/**
 * Verify a refresh token. Returns the payload or throws an error.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

/**
 * Hash a refresh token with SHA-256.
 * We store only the hash in the DB so a DB breach doesn't expose usable tokens.
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Calculate the expiry date for a refresh token (used when inserting into DB).
 */
function getRefreshTokenExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + config.jwt.refreshExpiresDays);
  return date;
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiry
};
