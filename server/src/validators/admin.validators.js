// server/src/validators/admin.validators.js
// express-validator rules for admin-only operations.

const { body, param } = require('express-validator');

// Rules for POST /api/admin/admins (create another admin)
const createAdminRules = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email is required.'),

  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters.'),

  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be under 100 characters.')
];

// Rules for param :id
const idParamRules = [
  param('id')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid ID parameter.')
];

module.exports = {
  createAdminRules,
  idParamRules
};
