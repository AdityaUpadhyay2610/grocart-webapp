// server/src/validators/category.validators.js
// express-validator rules for category endpoints.

const { body, param } = require('express-validator');

// Rules for POST /admin/categories (create or update a category)
const saveCategoryRules = [
  body('id')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category id must be between 1 and 100 characters.'),

  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name is required and must be under 100 characters.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters.'),

  body('image')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Image URL must be under 2000 characters.'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be true or false.')
];

// Validate :id param
const idParamRules = [
  param('id')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid category id.')
];

module.exports = { saveCategoryRules, idParamRules };
