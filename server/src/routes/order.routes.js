// server/src/routes/order.routes.js
// Routes for placing, viewing, and updating orders.

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const verifyToken = require('../middleware/verifyToken');
const { orderLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { placeOrderRules, updateStatusRules } = require('../validators/order.validators');

// All order routes require authentication
router.use(verifyToken);

// GET /api/orders/my — customer's order history
router.get('/my', orderController.getMyOrders);

// POST /api/orders — place a new order
router.post(
  '/',
  orderLimiter,
  placeOrderRules,
  validate,
  orderController.placeOrder
);

// PATCH /api/orders/:id/status — update status or cancel/return
router.patch(
  '/:id/status',
  updateStatusRules,
  validate,
  orderController.updateOrderStatus
);

module.exports = router;
