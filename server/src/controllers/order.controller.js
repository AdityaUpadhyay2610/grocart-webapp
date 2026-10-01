// server/src/controllers/order.controller.js
// Handles order creation with transactions and row locks, customer order history,
// and order status transitions (including stock/analytics reversion on cancellation).

const crypto = require('crypto');
const { query, getClient } = require('../config/db');
const { formatOrder } = require('../utils/formatters');
const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/orders/my — returns all orders placed by the logged-in customer
const getMyOrders = asyncHandler(async (req, res) => {
  const customerId = req.user.id;

  const ordersResult = await query(
    `SELECT o.*, u.email as customer_email
     FROM orders o
     JOIN users u ON o.customer_id = u.id
     WHERE o.customer_id = $1
     ORDER BY o.created_at DESC`,
    [customerId]
  );

  if (ordersResult.rows.length === 0) {
    return sendSuccess(res, []);
  }

  const orderIds = ordersResult.rows.map((o) => o.id);
  const itemsResult = await query(
    'SELECT * FROM order_items WHERE order_id = ANY($1::text[])',
    [orderIds]
  );

  // Group items by order_id
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

// POST /api/orders — place an order within a single atomic database transaction
const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { items, couponDiscount = 0, totalPaid, totalAmount } = req.body;
  const finalTotal = totalPaid !== undefined ? Number(totalPaid) : (Number(totalAmount) || 0);

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const orderId = req.body.id || crypto.randomUUID();
    const now = Date.now();
    let totalGMV = 0;
    let totalCost = 0;

    // 1. Lock and validate each product
    const preparedItems = [];
    for (const item of items) {
      const prodId = item.productId || item.id;
      const prodRes = await client.query(
        'SELECT * FROM products WHERE id = $1 FOR UPDATE',
        [prodId]
      );

      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return sendError(res, `${item.itemName || item.title || 'Product'} is no longer available.`, [], 400);
      }

      const product = prodRes.rows[0];
      const requestedQty = parseInt(item.quantity, 10);
      const availableStock = product.stock_quantity;

      if (requestedQty > availableStock) {
        await client.query('ROLLBACK');
        return sendError(res, `Only ${availableStock} left for ${product.title || item.itemName}.`, [], 409);
      }

      // Reduce product stock; mark out_of_stock if empty
      const newStock = availableStock - requestedQty;
      const newStatus = newStock === 0 ? 'out_of_stock' : product.status;
      await client.query(
        'UPDATE products SET stock_quantity = $1, status = $2, updated_at = $3 WHERE id = $4',
        [newStock, newStatus, now, prodId]
      );

      // Security Fix: Always use authoritative database prices/costs to prevent price tampering attacks
      const price = Number(product.selling_price);
      const cost = Number(product.cost_price);
      const lineRev = price * requestedQty;
      const lineCost = cost * requestedQty;

      totalGMV += lineRev;
      totalCost += lineCost;

      preparedItems.push({
        itemId: item.id,
        productId: prodId,
        itemName: item.itemName || product.title,
        itemPrice: price,
        itemCost: cost,
        itemQuantity: item.itemQuantity || product.item_quantity || '500g',
        imageUrl: item.imageUrl || product.image_url || '',
        quantity: requestedQty,
        retailerId: product.retailer_id, // Always take retailer_id from DB
        lineRev,
        lineCost
      });
    }

    // Security Fix: Compute total paid server-side after applying discount
    const computedTotalPaid = Math.max(0, totalGMV - Number(couponDiscount || 0));

    // 2. Insert into orders table
    await client.query(
      `INSERT INTO orders (id, customer_id, total_paid, coupon_discount, status, created_at)
       VALUES ($1, $2, $3, $4, 'placed', $5)`,
      [orderId, customerId, computedTotalPaid, Number(couponDiscount || 0), now]
    );

    // 3. Insert order items & update retailer analytics
    for (const item of preparedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, item_id, product_id, item_name, item_price, item_cost, item_quantity, image_url, quantity, retailer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [orderId, item.itemId, item.productId, item.itemName, item.itemPrice, item.itemCost, item.itemQuantity, item.imageUrl, item.quantity, item.retailerId]
      );

      // TODO: keep the current per-item-line behavior, aggregate in a future update
      if (item.retailerId) {
        const profit = item.lineRev - item.lineCost;
        await client.query(
          `INSERT INTO retailer_analytics (retailer_id, total_revenue, total_cost, gross_profit, total_orders_fulfilled, last_updated)
           VALUES ($1, $2, $3, $4, 1, $5)
           ON CONFLICT (retailer_id) DO UPDATE SET
             total_revenue = retailer_analytics.total_revenue + EXCLUDED.total_revenue,
             total_cost = retailer_analytics.total_cost + EXCLUDED.total_cost,
             gross_profit = retailer_analytics.gross_profit + EXCLUDED.gross_profit,
             total_orders_fulfilled = retailer_analytics.total_orders_fulfilled + 1,
             last_updated = EXCLUDED.last_updated`,
          [item.retailerId, item.lineRev, item.lineCost, profit, now]
        );
      }
    }

    // 4. Update platform analytics
    const totalPlatformProfit = totalGMV - totalCost;
    await client.query(
      `UPDATE platform_analytics
       SET total_gmv = total_gmv + $1,
           total_platform_profit = total_platform_profit + $2,
           total_orders = total_orders + 1
       WHERE id = 1`,
      [totalGMV, totalPlatformProfit]
    );

    // 5. Clear cart items for this customer
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [customerId]);

    await client.query('COMMIT');
    return sendSuccess(res, { orderId, id: orderId }, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PATCH /api/orders/:id/status — update order status or cancel/return with stock reversion
const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { status: newStatus } = req.body;
  const { id: userId, role: userRole } = req.user;

  // 1. Fetch existing order
  const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderRes.rows.length === 0) {
    return sendError(res, 'Order not found.', [], 404);
  }
  const order = orderRes.rows[0];

  // 2. Fetch order items to verify retailer involvement
  const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  const items = itemsRes.rows;

  // 3. Permission checks
  if (userRole === 'customer') {
    if (order.customer_id !== userId) {
      return sendError(res, 'You do not have permission to modify this order.', [], 403);
    }
    if (newStatus !== 'cancelled' && newStatus !== 'returned') {
      return sendError(res, 'Customers can only cancel or return an order.', [], 403);
    }
  } else if (userRole === 'retailer') {
    const hasRetailerItem = items.some((item) => item.retailer_id === userId);
    if (!hasRetailerItem) {
      return sendError(res, 'You do not have permission to modify this order.', [], 403);
    }
    if (newStatus !== 'processing' && newStatus !== 'delivered') {
      return sendError(res, 'Retailers can only update status to processing or delivered.', [], 403);
    }
  }

  // 4. Handle cancellation or return: revert stock, analytics, and delete the order
  if (newStatus === 'cancelled' || newStatus === 'returned') {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const now = Date.now();
      let totalGMV = 0;
      let totalCost = 0;

      for (const item of items) {
        // Revert product stock
        const prodRes = await client.query('SELECT stock_quantity, status FROM products WHERE id = $1 FOR UPDATE', [item.product_id]);
        if (prodRes.rows.length > 0) {
          const currentStock = prodRes.rows[0].stock_quantity;
          const restoredStock = currentStock + item.quantity;
          const status = (restoredStock > 0 && prodRes.rows[0].status === 'out_of_stock') ? 'active' : prodRes.rows[0].status;
          await client.query('UPDATE products SET stock_quantity = $1, status = $2, updated_at = $3 WHERE id = $4', [restoredStock, status, now, item.product_id]);
        }

        // Revert retailer analytics
        if (item.retailer_id) {
          const rev = Number(item.item_price) * item.quantity;
          const cost = Number(item.item_cost) * item.quantity;
          totalGMV += rev;
          totalCost += cost;

          await client.query(
            `UPDATE retailer_analytics
             SET total_revenue = GREATEST(0, total_revenue - $2),
                 total_cost = GREATEST(0, total_cost - $3),
                 gross_profit = GREATEST(0, total_revenue - $2) - GREATEST(0, total_cost - $3),
                 total_orders_fulfilled = GREATEST(0, total_orders_fulfilled - 1),
                 last_updated = $4
             WHERE retailer_id = $1`,
            [item.retailer_id, rev, cost, now]
          );
        }
      }

      // Revert platform analytics
      const profit = totalGMV - totalCost;
      await client.query(
        `UPDATE platform_analytics
         SET total_gmv = GREATEST(0, total_gmv - $1),
             total_platform_profit = GREATEST(0, total_platform_profit - $2),
             total_orders = GREATEST(0, total_orders - 1)
         WHERE id = 1`,
        [totalGMV, profit]
      );

      // Delete order (cascade deletes order_items)
      await client.query('DELETE FROM orders WHERE id = $1', [orderId]);

      await client.query('COMMIT');
      return sendSuccess(res, { message: `Order ${newStatus} and removed successfully.` });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // 5. Standard status update (processing, delivered, etc.)
  await query('UPDATE orders SET status = $1 WHERE id = $2', [newStatus, orderId]);
  return sendSuccess(res, { message: `Order status updated to ${newStatus}.` });
});

module.exports = {
  getMyOrders,
  placeOrder,
  updateOrderStatus
};
