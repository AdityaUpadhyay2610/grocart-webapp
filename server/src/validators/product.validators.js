// server/src/validators/product.validators.js
// express-validator rules for product endpoints.

const { body, param } = require('express-validator');
const config = require('../config/config');
const { PRODUCT_UNITS, PRODUCT_STATUS } = require('../config/constants');

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
    .isIn(PRODUCT_UNITS)
    .withMessage(`Unit must be one of: ${PRODUCT_UNITS.join(', ')}.`),

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
    .withMessage('Image URL must be under 2000 characters.')
    .custom((value) => {
      if (!value) {
        return true;
      }

      if (value.startsWith('/') && !value.startsWith('//')) {
        return true;
      }

      let imageUrl;
      try {
        imageUrl = new URL(value);
      } catch {
        throw new Error(config.security.productImageValidationMessage);
      }

      if (imageUrl.protocol !== 'https:' || !imageUrl.hostname) {
        throw new Error(config.security.productImageValidationMessage);
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(Object.values(PRODUCT_STATUS))
    .withMessage(`Status must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}.`)
];

// Validate :id param
const idParamRules = [
  param('id')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid product id.')
];

module.exports = { saveProductRules, idParamRules };
