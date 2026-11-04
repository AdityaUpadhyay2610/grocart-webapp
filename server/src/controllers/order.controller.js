const crypto = require('crypto');
const { query, getClient } = require('../config/db');
const razorpay = require('../config/razorpay');
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

// POST /api/orders — place a standard Cash On Delivery order within an atomic transaction
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

    // Lock products in a consistent sorted order so simultaneous orders do not deadlock.
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
        retailerId: product.retailer_id,
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

    // Include delivery & handling fees consistent with createRazorpayOrder
    const deliveryFee = totalGMV >= 500 ? 0 : 29;
    const handlingCharge = 5;
    const computedTotalPaid = Math.max(0, Math.round(totalGMV - couponDiscount + deliveryFee + handlingCharge));

    // Insert into orders table (payment_method: COD, payment_status: pending)
    await client.query(
      `INSERT INTO orders (id, customer_id, total_paid, coupon_discount, status, payment_method, payment_status, created_at)
       VALUES ($1, $2, $3, $4, 'placed', 'COD', 'pending', $5)`,
      [orderId, customerId, computedTotalPaid, couponDiscount, now]
    );

    // Insert order items & update retailer analytics
    for (const item of preparedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, item_id, product_id, item_name, item_price, item_cost, item_quantity, image_url, quantity, retailer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [orderId, item.itemId, item.productId, item.itemName, item.itemPrice, item.itemCost, item.itemQuantity, item.imageUrl, item.quantity, item.retailerId]
      );

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

    // Update platform analytics
    const totalPlatformProfit = totalGMV - totalCost;
    await client.query(
      `UPDATE platform_analytics
       SET total_gmv = total_gmv + $1,
           total_platform_profit = total_platform_profit + $2,
           total_orders = total_orders + 1
       WHERE id = 1`,
      [totalGMV, totalPlatformProfit]
    );

    // Clear cart items for this customer
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

// POST /api/orders/razorpay/create-order
// Calculates the true order total in paise on the server and creates a Razorpay gateway order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { items, couponCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return sendError(res, 'Order must contain at least one item.', [], 400);
  }

  // 1. Fetch real prices from database to compute total securely (prevent client tampering)
  const productIds = [...new Set(items.map((i) => i.productId || i.id))].sort();
  const productResult = await query(
    'SELECT id, selling_price, stock_quantity, status, title FROM products WHERE id = ANY($1::text[])',
    [productIds]
  );
  const productsById = new Map(productResult.rows.map((p) => [p.id, p]));

  let totalGMV = 0;
  for (const item of items) {
    const prodId = item.productId || item.id;
    const product = productsById.get(prodId);
    if (!product || product.status !== 'active') {
      return sendError(res, `Product "${product ? product.title : prodId}" is currently unavailable.`, [], 400);
    }
    const requestedQty = parseInt(item.quantity, 10);
    if (requestedQty > product.stock_quantity) {
      return sendError(res, `Only ${product.stock_quantity} units available for ${product.title}.`, [], 409);
    }
    totalGMV += Number(product.selling_price) * requestedQty;
  }

  // 2. Validate coupon if provided
  let couponDiscount = 0;
  if (couponCode) {
    const client = await getClient();
    try {
      const couponResult = await findValidCoupon(client, couponCode, totalGMV, false);
      if (!couponResult.error) {
        couponDiscount = couponResult.coupon.discount;
      }
    } finally {
      client.release();
    }
  }

  // 3. Compute delivery & handling fees (matching frontend calculations)
  const deliveryFee = totalGMV >= 500 ? 0 : 29;
  const handlingCharge = 5;
  const grandTotal = Math.max(1, Math.round(totalGMV - couponDiscount + deliveryFee + handlingCharge));

  // Razorpay accepts amounts strictly in paise (1 INR = 100 paise)
  const amountInPaise = grandTotal * 100;
  const receipt = `rcpt_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt,
    notes: {
      customerId: String(customerId),
      couponCode: couponCode || ''
    }
  };

  try {
    const rzpOrder = await razorpay.orders.create(options);
    return sendSuccess(res, {
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      computedGrandTotal: grandTotal,
      receipt: rzpOrder.receipt
    }, 201);
  } catch (err) {
    console.error('Razorpay Order Creation Error:', err);
    return sendError(res, 'Failed to initialize payment gateway order.', [], 500);
  }
});

// POST /api/orders/razorpay/verify
// Verifies HMAC-SHA256 signature, locks product rows, inserts order, updates analytics, clears cart
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    couponCode,
    paymentMethod = 'ONLINE'
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendError(res, 'Missing required payment verification parameters.', [], 400);
  }

  // 1. Verify cryptographic HMAC-SHA256 signature
  const bodyData = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(bodyData)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.error(`[Security Alert] Signature mismatch for customer ${customerId}`);
    return sendError(res, 'Payment verification failed: invalid signature.', [], 400);
  }

  // Idempotency check: prevent duplicate order creation if customer retries
  const existingOrderResult = await query(
    'SELECT id, payment_status FROM orders WHERE razorpay_order_id = $1',
    [razorpay_order_id]
  );
  if (existingOrderResult.rows.length > 0) {
    return sendSuccess(res, {
      orderId: existingOrderResult.rows[0].id,
      id: existingOrderResult.rows[0].id,
      paymentId: razorpay_payment_id,
      replayed: true
    }, 200);
  }

  // 2. Begin ACID Transaction
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const orderId = crypto.randomUUID();
    const now = Date.now();
    let totalGMV = 0;
    let totalCost = 0;

    // Lock products in consistent sorted order to prevent deadlock
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
        return sendError(res, 'One or more products became unavailable during checkout.', [], 400);
      }

      const requestedQty = parseInt(item.quantity, 10);
      const totalRequested = (quantitiesByProduct.get(prodId) || 0) + requestedQty;
      quantitiesByProduct.set(prodId, totalRequested);

      if (totalRequested > product.stock_quantity) {
        await client.query('ROLLBACK');
        return sendError(res, `Stock depleted for ${product.title}.`, [], 409);
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
        retailerId: product.retailer_id,
        lineRev,
        lineCost
      });
    }

    // Deduct inventory
    for (const [productId, requestedQty] of quantitiesByProduct) {
      const product = productsById.get(productId);
      const newStock = product.stock_quantity - requestedQty;
      const newStatus = newStock === 0 ? PRODUCT_STATUS.OUT_OF_STOCK : PRODUCT_STATUS.ACTIVE;
      await client.query(
        'UPDATE products SET stock_quantity = $1, status = $2, updated_at = $3 WHERE id = $4',
        [newStock, newStatus, now, productId]
      );
    }

    // Redeem coupon
    let couponDiscount = 0;
    if (couponCode) {
      const couponResult = await findValidCoupon(client, couponCode, totalGMV, true);
      if (!couponResult.error) {
        await incrementCouponUse(client, couponResult.coupon.code);
        couponDiscount = couponResult.coupon.discount;
      }
    }

    const computedTotalPaid = Math.max(0, totalGMV - couponDiscount);

    // Insert order with payment status: 'paid'
    await client.query(
      `INSERT INTO orders (
        id, customer_id, total_paid, coupon_discount, status, 
        payment_method, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature, created_at
      ) VALUES ($1, $2, $3, $4, 'placed', $5, 'paid', $6, $7, $8, $9)`,
      [
        orderId, customerId, computedTotalPaid, couponDiscount,
        paymentMethod, razorpay_order_id, razorpay_payment_id, razorpay_signature, now
      ]
    );

    // Insert order items & update retailer analytics
    for (const item of preparedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, item_id, product_id, item_name, item_price, item_cost, item_quantity, image_url, quantity, retailer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [orderId, item.itemId, item.productId, item.itemName, item.itemPrice, item.itemCost, item.itemQuantity, item.imageUrl, item.quantity, item.retailerId]
      );

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

    // Update platform GMV
    await client.query(
      `UPDATE platform_analytics
       SET total_gmv = total_gmv + $1,
           total_platform_profit = total_platform_profit + $2,
           total_orders = total_orders + 1
       WHERE id = 1`,
      [totalGMV, totalGMV - totalCost]
    );

    // Clear cart items for this customer
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [customerId]);

    await client.query('COMMIT');
    return sendSuccess(res, { orderId, id: orderId, paymentId: razorpay_payment_id }, 201);
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
  createRazorpayOrder,
  verifyRazorpayPayment,
  updateOrderStatus
};