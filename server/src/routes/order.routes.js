// server/src/routes/order.routes.js
// Routes for placing, viewing, creating Razorpay orders, and verifying payments.

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const verifyToken = require('../middleware/verifyToken');
const { orderLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const {
  placeOrderRules,
  createRazorpayOrderRules,
  verifyRazorpayPaymentRules,
  updateStatusRules
} = require('../validators/order.validators');

// All order routes require authenticated user session
router.use(verifyToken);

// GET /api/orders/my — customer's order history
router.get('/my', orderController.getMyOrders);

// POST /api/orders — place a standard Cash On Delivery order
router.post(
  '/',
  orderLimiter,
  placeOrderRules,
  validate,
  orderController.placeOrder
);

// POST /api/orders/razorpay/create-order — initialize Razorpay gateway order
router.post(
  '/razorpay/create-order',
  orderLimiter,
  createRazorpayOrderRules,
  validate,
  orderController.createRazorpayOrder
);

// POST /api/orders/razorpay/verify — verify HMAC signature & commit order
router.post(
  '/razorpay/verify',
  orderLimiter,
  verifyRazorpayPaymentRules,
  validate,
  orderController.verifyRazorpayPayment
);

// PATCH /api/orders/:id/status — update status or cancel/return
router.patch(
  '/:id/status',
  updateStatusRules,
  validate,
  orderController.updateOrderStatus
);

module.exports = router;