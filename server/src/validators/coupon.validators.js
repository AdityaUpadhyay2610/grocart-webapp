const { body } = require('express-validator');

const validateCouponRules = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Cart items are required.'),
  body('items.*.productId')
    .trim()
    .notEmpty()
    .withMessage('Each cart item must have a product id.'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each cart item quantity must be a positive whole number.')
];

module.exports = {
  validateCouponRules
};
