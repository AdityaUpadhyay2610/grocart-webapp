// server/src/validators/cart.validators.js
// express-validator rules for shopping cart operations.

const { body, param } = require('express-validator');

// Rules for PUT /cart/items/:itemId
const saveCartItemRules = [
  param('itemId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Item id must be between 1 and 100 characters.'),

  body('productId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Product id must be under 100 characters.'),

  body('itemName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Item name is required and must be under 200 characters.'),

  body('itemPrice')
    .isFloat({ min: 0 })
    .withMessage('Item price must be a number >= 0.'),

  body('itemCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Item cost must be a number >= 0.'),

  body('itemQuantity')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Item quantity must be under 50 characters.'),

  body('imageUrl')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Image URL must be under 2000 characters.'),

  body('quantity')
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be a whole number between 1 and 999.'),

  body('itemStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Item stock must be a number >= 0.'),

  body('retailerId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Retailer id must be under 100 characters.')
];

// Rules for DELETE /cart/items/:itemId
const itemIdParamRules = [
  param('itemId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid item id.')
];

module.exports = {
  saveCartItemRules,
  itemIdParamRules
};
