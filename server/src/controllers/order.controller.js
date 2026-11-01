// server/src/controllers/order.controller.js
// Handles order creation with transactions and row locks, customer order history,
// and order status transitions (including stock/analytics reversion on cancellation).

const crypto = require('crypto');
const { query, getClient } = require('../config/db');
const { formatOrder } = require('../utils/formatters');
const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { findValidCoupon, incrementCouponUse } = require('../utils/coupons');
const {
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  PRODUCT_STATUS
} = require('../config/constants');

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
  const { items, couponCode } = req.body;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const orderId = crypto.randomUUID();
    const now = Date.now();
    let totalGMV = 0;
    let totalCost = 0;

    // Lock products in a consistent order so simultaneous orders do not deadlock.
    const productIds = [...new Set(items.map((item) => item.productId || item.id))].sort();
    const productResult = await client.query(
      'SELECT * FROM products WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE',
      [productIds]
    );
    const productsById = new Map(productResult.rows.map((product) => [product.id, product]));
    const quantitiesByProduct = new Map();
    const preparedItems = [];
    for (const item of items) {
      const prodId = item.productId || item.id;
      const product = productsById.get(prodId);
      if (!product || product.status !== 'active') {
        await client.query('ROLLBACK');
        return sendError(res, 'One or more products are no longer available.', [], 400);
      }

      const requestedQty = parseInt(item.quantity, 10);
      const totalRequested = (quantitiesByProduct.get(prodId) || 0) + requestedQty;
      quantitiesByProduct.set(prodId, totalRequested);
      if (totalRequested > product.stock_quantity) {
        await client.query('ROLLBACK');
        return sendError(res, `Only ${product.stock_quantity} left for ${product.title}.`, [], 409);
      }

      const price = Number(product.selling_price);
      const cost = Number(product.cost_price);
      const lineRev = price * requestedQty;
      const lineCost = cost * requestedQty;

      totalGMV += lineRev;
      totalCost += lineCost;

      preparedItems.push({
        itemId: item.id,
        productId: prodId,
        itemName: product.title,
        itemPrice: price,
        itemCost: cost,
        itemQuantity: item.itemQuantity || product.item_quantity || '500g',
        imageUrl: product.image_url || '',
        quantity: requestedQty,
        retailerId: product.retailer_id, // Always take retailer_id from DB
        lineRev,
        lineCost
      });
    }

    for (const [productId, requestedQty] of quantitiesByProduct) {
      const product = productsById.get(productId);
      const newStock = product.stock_quantity - requestedQty;
      const newStatus = newStock === 0 ? PRODUCT_STATUS.OUT_OF_STOCK : PRODUCT_STATUS.ACTIVE;
      await client.query(
        'UPDATE products SET stock_quantity = $1, status = $2, updated_at = $3 WHERE id = $4',
        [newStock, newStatus, now, productId]
      );
    }

    let couponDiscount = 0;
    if (couponCode) {
      const couponResult = await findValidCoupon(client, couponCode, totalGMV, true);
      if (couponResult.error) {
        await client.query('ROLLBACK');
        return sendError(res, couponResult.error, [], 400);
      }
      const used = await incrementCouponUse(client, couponResult.coupon.code);
      if (!used) {
        await client.query('ROLLBACK');
        return sendError(res, 'Coupon is no longer available.', [], 409);
      }
      couponDiscount = couponResult.coupon.discount;
    }

    const computedTotalPaid = Math.max(0, totalGMV - couponDiscount);

    // 2. Insert into orders table
    await client.query(
      `INSERT INTO orders (id, customer_id, total_paid, coupon_discount, status, created_at)
       VALUES ($1, $2, $3, $4, 'placed', $5)`,
      [orderId, customerId, computedTotalPaid, couponDiscount, now]
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
  const { id: orderId } = req.params;
  const { status: newStatus } = req.body;
  const { id: userId, role: userRole } = req.user;
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
      [orderId]
    );
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Order not found.', [], 404);
    }
    const order = orderResult.rows[0];
    const itemResult = await client.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );
    const items = itemResult.rows;

    if (userRole === 'customer' && order.customer_id !== userId) {
      await client.query('ROLLBACK');
      return sendError(res, 'You do not have permission to modify this order.', [], 403);
    }
    if (userRole === 'retailer' && !items.some((item) => item.retailer_id === userId)) {
      await client.query('ROLLBACK');
      return sendError(res, 'You do not have permission to modify this order.', [], 403);
    }

    const allowedStatuses = ORDER_STATUS_TRANSITIONS[order.status]?.[userRole] || [];
    if (!allowedStatuses.includes(newStatus)) {
      await client.query('ROLLBACK');
      return sendError(res, 'This order status change is not allowed.', [], 409);
    }

    if (newStatus === ORDER_STATUS.CANCELLED || newStatus === ORDER_STATUS.RETURNED) {
      const productIds = [...new Set(items.map((item) => item.product_id))].sort();
      const productResult = await client.query(
        'SELECT id, stock_quantity, status FROM products WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE',
        [productIds]
      );
      const productsById = new Map(productResult.rows.map((product) => [product.id, product]));
      const now = Date.now();
      let totalGMV = 0;
      let totalCost = 0;

      for (const item of items) {
        const product = productsById.get(item.product_id);
        if (product) {
          const restoredStock = product.stock_quantity + item.quantity;
          const restoredStatus = product.status === PRODUCT_STATUS.OUT_OF_STOCK
            ? PRODUCT_STATUS.ACTIVE
            : product.status;
          product.stock_quantity = restoredStock;
          product.status = restoredStatus;
        }

        if (item.retailer_id) {
          const revenue = Number(item.item_price) * item.quantity;
          const cost = Number(item.item_cost) * item.quantity;
          totalGMV += revenue;
          totalCost += cost;

          await client.query(
            `UPDATE retailer_analytics
             SET total_revenue = GREATEST(0, total_revenue - $2),
                 total_cost = GREATEST(0, total_cost - $3),
                 gross_profit = GREATEST(0, total_revenue - $2) - GREATEST(0, total_cost - $3),
                 total_orders_fulfilled = GREATEST(0, total_orders_fulfilled - 1),
                 last_updated = $4
             WHERE retailer_id = $1`,
            [item.retailer_id, revenue, cost, now]
          );
        }
      }

      for (const product of productsById.values()) {
        await client.query(
          'UPDATE products SET stock_quantity = $1, status = $2, updated_at = $3 WHERE id = $4',
          [product.stock_quantity, product.status, now, product.id]
        );
      }

      await client.query(
        `UPDATE platform_analytics
         SET total_gmv = GREATEST(0, total_gmv - $1),
             total_platform_profit = GREATEST(0, total_platform_profit - $2),
             total_orders = GREATEST(0, total_orders - 1)
         WHERE id = 1`,
        [totalGMV, totalGMV - totalCost]
      );
    }

    await client.query('UPDATE orders SET status = $1 WHERE id = $2', [newStatus, orderId]);
    await client.query('COMMIT');
    return sendSuccess(res, { message: `Order status updated to ${newStatus}.` });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = {
  getMyOrders,
  placeOrder,
  updateOrderStatus
};
