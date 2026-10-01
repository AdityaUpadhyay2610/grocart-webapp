// server/src/controllers/admin.controller.js
// Handles administrative operations: viewing/deleting users, creating admin accounts,
// viewing all platform orders, and platform-wide aggregate analytics.

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const config = require('../config/config');
const { formatUser, formatOrder, formatPlatformAnalytics } = require('../utils/formatters');
const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/users — fetch all users across all roles (customer, retailer, admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT * FROM users ORDER BY created_at DESC',
    []
  );
  const users = result.rows.map(formatUser);
  return sendSuccess(res, users);
});

// DELETE /api/admin/users/:id — delete a user account; cascades to products/cart/orders
const deleteUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentAdminId = req.user.id;

  // Prevent an admin from deleting their own account
  if (targetUserId === currentAdminId) {
    return sendError(res, 'You cannot delete your own admin account.', [], 400);
  }

  // Check if target user exists
  const existing = await query('SELECT id FROM users WHERE id = $1', [targetUserId]);
  if (existing.rows.length === 0) {
    return sendError(res, 'User not found.', [], 404);
  }

  // ON DELETE CASCADE removes user's products, cart items, orders, analytics, and refresh tokens
  await query('DELETE FROM users WHERE id = $1', [targetUserId]);
  return sendSuccess(res, { message: 'User deleted successfully.' });
});

// POST /api/admin/admins — create another administrator account
const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check for duplicate email
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    return sendError(res, 'Email is already registered.', [], 409);
  }

  // Hash password using configured bcrypt rounds
  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
  const adminId = crypto.randomUUID();
  const now = Date.now();

  const result = await query(
    `INSERT INTO users (id, name, email, password_hash, role, created_at, email_verified)
     VALUES ($1, $2, $3, $4, 'admin', $5, TRUE)
     RETURNING *`,
    [adminId, name.trim(), normalizedEmail, passwordHash, now]
  );

  return sendSuccess(res, { user: formatUser(result.rows[0]) }, 201);
});

// GET /api/admin/orders — fetch all orders on the platform
const getAllOrders = asyncHandler(async (req, res) => {
  const ordersResult = await query(
    `SELECT o.*, u.email as customer_email
     FROM orders o
     JOIN users u ON o.customer_id = u.id
     ORDER BY o.created_at DESC`,
    []
  );

  if (ordersResult.rows.length === 0) {
    return sendSuccess(res, []);
  }

  const orderIds = ordersResult.rows.map((o) => o.id);
  const itemsResult = await query(
    'SELECT * FROM order_items WHERE order_id = ANY($1::text[])',
    [orderIds]
  );

  const itemsByOrder = {};
  for (const item of itemsResult.rows) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push(item);
  }

  const formatted = ordersResult.rows.map((order) =>
    formatOrder(order, itemsByOrder[order.id] || [])
  );

  return sendSuccess(res, formatted);
});

// GET /api/admin/platform-analytics — compute high-level platform health metrics
const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const platformRes = await query('SELECT * FROM platform_analytics WHERE id = 1', []);
  const retailerCountRes = await query(
    "SELECT COUNT(*) as count FROM users WHERE role = 'retailer'",
    []
  );

  const platformRow = platformRes.rows[0] || {
    total_gmv: 0,
    total_platform_profit: 0,
    total_orders: 0
  };
  const totalRetailers = parseInt(retailerCountRes.rows[0]?.count || 0, 10);

  return sendSuccess(res, formatPlatformAnalytics(platformRow, totalRetailers));
});

module.exports = {
  getAllUsers,
  deleteUser,
  createAdmin,
  getAllOrders,
  getPlatformAnalytics
};
