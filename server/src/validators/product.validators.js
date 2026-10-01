// server/src/validators/product.validators.js
// express-validator rules for product endpoints.

const { body, param } = require('express-validator');

// Units the app supports. Must match what the frontend sends.
const ALLOWED_UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'liter', 'dozen', 'pack', 'bunch', 'bottle', 'box', 'bag'];

// Rules for PUT /retailer/products/:id (create or update a product)
const saveProductRules = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product title is required and must be under 200 characters.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be under 2000 characters.'),

  body('categoryId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category id must be under 100 characters.'),

  body('categoryName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category name must be under 100 characters.'),

  body('costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a number greater than or equal to 0.'),

  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a number greater than or equal to 0.'),

  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a whole number >= 0.'),

  body('unit')
    .optional({ checkFalsy: true })
    .customSanitizer((val) => (typeof val === 'string' ? val.toLowerCase().trim() : val))
    .isIn(ALLOWED_UNITS)
    .withMessage(`Unit must be one of: ${ALLOWED_UNITS.join(', ')}.`),

  body('unitSize')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Unit size must be a positive number.'),

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

  body('status')
    .optional()
    .isIn(['active', 'out_of_stock', 'inactive'])
    .withMessage('Status must be active, out_of_stock, or inactive.')
];

// Validate :id param
const idParamRules = [
  param('id')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid product id.')
];

module.exports = { saveProductRules, idParamRules };
