// Handles register, login, refresh, logout, /me, and resend-verification.

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query, getClient } = require('../config/db');
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

const dummyPasswordHash = bcrypt.hashSync(
  crypto.randomBytes(32).toString('hex'),
  config.security.bcryptRounds
);

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
async function saveRefreshToken(userId, rawToken, client = null) {
  const hash = hashToken(rawToken);
  const expiresAt = getRefreshTokenExpiry();
  const executeQuery = client ? client.query.bind(client) : query;
  await executeQuery(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hash, expiresAt]
  );
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { email, password, name, role, storeName = '' } = req.body;
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
  const userId = crypto.randomUUID();
  const createdAt = Date.now();

  await query(
    `INSERT INTO users (id, name, email, password_hash, role, store_name, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (email) DO NOTHING`,
    [userId, name.trim(), normalizedEmail, passwordHash, role, storeName.trim(), createdAt]
  );

  return sendSuccess(
    res,
    { message: config.security.authMessages.registrationNeutral },
    202
  );
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

  // Use the same error message for both "wrong email" and "wrong password"
  // to prevent attackers from guessing which emails exist.
  const genericError = config.security.authMessages.invalidCredentials;

  const user = result.rows[0];
  const passwordHash = user ? user.password_hash : dummyPasswordHash;
  const isMatch = await bcrypt.compare(password, passwordHash);
  if (!user || !isMatch) {
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

  if (!payload.sub) {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return sendError(res, 'Refresh token is invalid or has expired.', [], 401);
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');
    const rotated = await client.query(
      `DELETE FROM refresh_tokens
       WHERE token_hash = $1 AND expires_at > NOW()
       RETURNING user_id`,
      [hashToken(rawToken)]
    );

    if (rotated.rows.length === 0) {
      await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [payload.sub]);
      await client.query('COMMIT');
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return sendError(res, 'Refresh token has been revoked or expired.', [], 401);
    }

    const userId = rotated.rows[0].user_id;
    const userResult = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return sendError(res, 'User not found.', [], 401);
    }

    const user = userResult.rows[0];
    const newAccessToken = createAccessToken(user.id, user.role);
    const newRefreshToken = createRefreshToken(user.id);
    await saveRefreshToken(user.id, newRefreshToken, client);
    await client.query('COMMIT');

    res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions());
    return sendSuccess(res, { user: formatUser(user), accessToken: newAccessToken });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies.refreshToken;

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });
  return sendSuccess(res, { message: 'Logged out successfully.' });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      'SELECT password_hash FROM users WHERE id = $1 FOR UPDATE',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'User not found.', [], 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );
    if (!isCurrentPasswordValid) {
      await client.query('ROLLBACK');
      return sendError(res, 'Current password is incorrect.', [], 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, req.user.id]
    );
    await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);
    await client.query('COMMIT');

    res.clearCookie('refreshToken', { path: '/api/auth' });
    return sendSuccess(res, { message: 'Password changed successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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
  return sendSuccess(res, { message: 'Verification email sent. Please check your inbox.' });
});



module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword,
  getMe,
  resendVerification
};
