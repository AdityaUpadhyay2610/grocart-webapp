// server/src/validators/order.validators.js
// express-validator rules for placing and updating orders.

const { body, param } = require('express-validator');
const { ORDER_STATUSES } = require('../config/constants');

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

  body('couponCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Coupon code must be between 1 and 100 characters.')
];

// Rules for PATCH /api/orders/:id/status
const updateStatusRules = [
  param('id')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid order id.'),

  body('status')
    .isIn(ORDER_STATUSES)
    .withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}.`)
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
