// server/src/controllers/retailer.controller.js
// Handles retailer dashboard analytics and retailer-specific order fulfillment queries.

const { query } = require('../config/db');
const { formatOrder, formatRetailerAnalytics } = require('../utils/formatters');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/retailer/analytics — fetch sales/revenue metrics for this retailer
const getRetailerAnalytics = asyncHandler(async (req, res) => {
  const retailerId = req.user.id;
  const result = await query(
    'SELECT * FROM retailer_analytics WHERE retailer_id = $1',
    [retailerId]
  );

  // Return data: null if no sales yet (UI handles null gracefully)
  if (result.rows.length === 0) {
    return sendSuccess(res, null);
  }

  return sendSuccess(res, formatRetailerAnalytics(result.rows[0]));
});

// GET /api/retailer/orders — fetch all orders containing items from this retailer
const getRetailerOrders = asyncHandler(async (req, res) => {
  const retailerId = req.user.id;

  // 1. Find distinct order IDs containing items owned by this retailer
  const idsResult = await query(
    'SELECT DISTINCT order_id FROM order_items WHERE retailer_id = $1',
    [retailerId]
  );

  if (idsResult.rows.length === 0) {
    return sendSuccess(res, []);
  }

  const orderIds = idsResult.rows.map((r) => r.order_id);

  // 2. Fetch the orders with joined customer user details
  const ordersResult = await query(
    `SELECT o.*,
            u.id as u_id, u.name as u_name, u.email as u_email, u.role as u_role,
            u.store_name as u_store_name, u.phone_number as u_phone_number,
            u.address as u_address, u.avatar_style as u_avatar_style,
            u.avatar_seed as u_avatar_seed, u.avatar_url as u_avatar_url,
            u.created_at as u_created_at, u.email_verified as u_email_verified
     FROM orders o
     JOIN users u ON o.customer_id = u.id
     WHERE o.id = ANY($1::text[])
     ORDER BY o.created_at DESC`,
    [orderIds]
  );

  // 3. Fetch all order items for these orders
  const itemsResult = await query(
    'SELECT * FROM order_items WHERE order_id = ANY($1::text[])',
    [orderIds]
  );

  const itemsByOrder = {};
  for (const item of itemsResult.rows) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push(item);
  }

  // 4. Format each order including full customer details
  const formatted = ordersResult.rows.map((row) => {
    const customerUser = {
      id: row.u_id,
      name: row.u_name,
      email: row.u_email,
      role: row.u_role,
      store_name: row.u_store_name,
      phone_number: row.u_phone_number,
      address: row.u_address,
      avatar_style: row.u_avatar_style,
      avatar_seed: row.u_avatar_seed,
      avatar_url: row.u_avatar_url,
      created_at: row.u_created_at,
      email_verified: row.u_email_verified
    };
    return formatOrder(row, itemsByOrder[row.id] || [], customerUser);
  });

  return sendSuccess(res, formatted);
});

module.exports = {
  getRetailerAnalytics,
  getRetailerOrders
};
