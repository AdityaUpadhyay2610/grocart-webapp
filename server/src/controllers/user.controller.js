// server/src/controllers/user.controller.js
// Handles updating the logged-in user's own profile (PUT /users/me).

const { query } = require('../config/db');
const { formatUser } = require('../utils/formatters');
const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// PUT /api/users/me
// Updates whichever profile fields were sent. Identity comes from the token (req.user.id).
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Always from token, never from body

  // Build a dynamic update query with only the fields that were provided
  const fieldMap = {
    name: 'name',
    storeName: 'store_name',
    phoneNumber: 'phone_number',
    address: 'address',
    avatarStyle: 'avatar_style',
    avatarSeed: 'avatar_seed',
    avatarUrl: 'avatar_url'
  };

  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [bodyField, dbColumn] of Object.entries(fieldMap)) {
    if (req.body[bodyField] !== undefined) {
      setClauses.push(`${dbColumn} = $${paramIndex}`);
      values.push(req.body[bodyField]);
      paramIndex++;
    }
  }

  // Nothing to update
  if (setClauses.length === 0) {
    const current = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (current.rows.length === 0) return sendError(res, 'User not found.', [], 404);
    return sendSuccess(res, { user: formatUser(current.rows[0]) });
  }

  values.push(userId);
  const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

  const result = await query(sql, values);
  if (result.rows.length === 0) {
    return sendError(res, 'User not found.', [], 404);
  }

  return sendSuccess(res, { user: formatUser(result.rows[0]) });
});

module.exports = { updateProfile };
