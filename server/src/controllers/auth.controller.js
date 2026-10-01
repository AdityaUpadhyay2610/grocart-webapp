// server/src/controllers/auth.controller.js
// Handles register, login, refresh, logout, /me, and resend-verification.

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/db');
const config = require('../config/config');
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiry
} = require('../utils/tokens');
const { formatUser } = require('../utils/formatters');
const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// Cookie settings for the refresh token
function getRefreshCookieOptions() {
  return {
    httpOnly: true,   // JavaScript in the browser cannot read this cookie
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/api/auth', // Cookie is only sent to auth routes
    maxAge: config.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000 // ms
  };
}

// Helper: save a new refresh token hash in the DB
async function saveRefreshToken(userId, rawToken) {
  const hash = hashToken(rawToken);
  const expiresAt = getRefreshTokenExpiry();
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hash, expiresAt]
  );
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { email, password, name, role, storeName = '' } = req.body;
  const normalizedEmail = email.toLowerCase();

  // Check if email is already taken
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    return sendError(res, 'An account with this email already exists.', [], 409);
  }

  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
  const userId = crypto.randomUUID();
  const createdAt = Date.now();

  await query(
    `INSERT INTO users (id, name, email, password_hash, role, store_name, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, name.trim(), normalizedEmail, passwordHash, role, storeName.trim(), createdAt]
  );

  const userRow = await query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = formatUser(userRow.rows[0]);

  const accessToken = createAccessToken(userId, role);
  const refreshToken = createRefreshToken(userId);
  await saveRefreshToken(userId, refreshToken);

  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
  return sendSuccess(res, { user, accessToken }, 201);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

  // Use the same error message for both "wrong email" and "wrong password"
  // to prevent attackers from guessing which emails exist.
  const genericError = 'Invalid email or password.';

  if (result.rows.length === 0) {
    return sendError(res, genericError, [], 401);
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return sendError(res, genericError, [], 401);
  }

  const accessToken = createAccessToken(user.id, user.role);
  const refreshToken = createRefreshToken(user.id);
  await saveRefreshToken(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
  return sendSuccess(res, { user: formatUser(user), accessToken });
});

// POST /api/auth/refresh
// Rotates the refresh token: verifies cookie, deletes old hash, issues new token pair.
const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies.refreshToken;
  if (!rawToken) return sendError(res, 'Refresh token not found.', [], 401);

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return sendError(res, 'Refresh token is invalid or has expired.', [], 401);
  }

  const tokenHash = hashToken(rawToken);
  const stored = await query(
    'SELECT id, user_id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  );

  if (stored.rows.length === 0) {
    // Token not in DB — possible reuse attack, clear cookie
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return sendError(res, 'Refresh token has been revoked or expired.', [], 401);
  }

  const userId = stored.rows[0].user_id;

  // Delete the old refresh token (rotation: each token can only be used once)
  await query('DELETE FROM refresh_tokens WHERE id = $1', [stored.rows[0].id]);

  const userRow = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (userRow.rows.length === 0) {
    return sendError(res, 'User not found.', [], 401);
  }

  const user = userRow.rows[0];
  const newAccessToken = createAccessToken(user.id, user.role);
  const newRefreshToken = createRefreshToken(user.id);
  await saveRefreshToken(user.id, newRefreshToken);

  res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions());
  return sendSuccess(res, { user: formatUser(user), accessToken: newAccessToken });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies.refreshToken;

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    // Delete this specific token
    await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
    // Also clean up any expired tokens for this user
    try {
      const stored = await query('SELECT user_id FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
      // token was already deleted, try to get user from payload
    } catch {}
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });
  return sendSuccess(res, { message: 'Logged out successfully.' });
});

// GET /api/auth/me
// Returns the current user's profile using the access token.
const getMe = asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (result.rows.length === 0) {
    return sendError(res, 'User not found.', [], 404);
  }
  return sendSuccess(res, { user: formatUser(result.rows[0]) });
});

// POST /api/auth/resend-verification
// Stub: email verification is out of scope. All users have email_verified = true.
const resendVerification = asyncHandler(async (req, res) => {
  // TODO: integrate an SMTP service (e.g., SendGrid, Resend) to send real verification emails.
  return sendSuccess(res, { message: 'Verification email sent. Please check your inbox.' });
});



module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  resendVerification
};
