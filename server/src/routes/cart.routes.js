// server/src/routes/cart.routes.js
// Routes for user shopping cart operations.

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { saveCartItemRules, itemIdParamRules } = require('../validators/cart.validators');

// All cart routes require authentication
router.use(verifyToken);

// GET /api/cart — fetch current user's cart
router.get('/', cartController.getCart);

// PUT /api/cart/items/:itemId — save or update item in cart
router.put(
  '/items/:itemId',
  saveCartItemRules,
  validate,
  cartController.saveCartItem
);

// DELETE /api/cart/items/:itemId — remove single item from cart
router.delete(
  '/items/:itemId',
  itemIdParamRules,
  validate,
  cartController.removeCartItem
);

// DELETE /api/cart — clear entire cart
router.delete('/', cartController.clearCart);

module.exports = router;
