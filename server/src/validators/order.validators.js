// server/src/validators/order.validators.js
// express-validator rules for placing and updating orders.

const { body, param } = require('express-validator');

// Rules for POST /api/orders (place an order)
const placeOrderRules = [
  body('items')
    .isArray({ min: 1, max: 100 })
    .withMessage('Order must contain between 1 and 100 items.'),

  body('items.*.id')
    .trim()
    .notEmpty()
    .withMessage('Each item must have an id.'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 999 })
    .withMessage('Each item quantity must be between 1 and 999.'),

  body('totalPaid')
    .isFloat({ min: 0 })
    .withMessage('Total paid must be a number >= 0.'),

  body('couponDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Coupon discount must be a number >= 0.')
];

// Rules for PATCH /api/orders/:id/status
const updateStatusRules = [
  param('id')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid order id.'),

  body('status')
    .isIn(['placed', 'processing', 'delivered', 'cancelled', 'returned'])
    .withMessage('Status must be one of: placed, processing, delivered, cancelled, returned.')
];

// Rules for param :id
const idParamRules = [
  param('id')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid order id.')
];

module.exports = {
  placeOrderRules,
  updateStatusRules,
  idParamRules
};
