// server/src/validators/auth.validators.js
// express-validator rules for auth endpoints (register, login, resend-verification).

const { body } = require('express-validator');

// Rules for POST /auth/register
const registerRules = [
  body('email')
    .trim()
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters.'),

  body('confirmPassword')
    .if(body('password').exists())
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),

  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be under 100 characters.'),

  // Only 'customer' or 'retailer' are allowed on the public register endpoint.
  // Admins are created separately through POST /admin/admins.
  body('role')
    .isIn(['customer', 'retailer'])
    .withMessage('Role must be either "customer" or "retailer". Admins are created by an existing admin.'),

  // storeName is required only when registering as a retailer
  body('storeName')
    .if(body('role').equals('retailer'))
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Store name is required for retailer accounts.')
];

// Rules for POST /auth/login
const loginRules = [
  body('email')
    .trim()
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required.')
];

const changePasswordRules = [
  body('currentPassword')
    .isLength({ min: 1 })
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 72 })
    .withMessage('New password must be between 8 and 72 characters.')
];

//Rules for POST /auth/google
//A google Id token is a JWT: three base64url parts separated by dots.

const googleLoginRules = [
  body('credential')
    .isString().withMessage('Google credential is required.')
    .isLength({ min: 100, max: 4096 }).withMessage('Google credential is malformed.')
    .matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    .withMessage('Google credential is malformed.'),

  body('intent')
    .optional()
    .isIn(['login', 'register'])
    .withMessage('Google auth intent must be either "login" or "register".'),

  body('role')
    .optional()
    .isIn(['customer', 'retailer'])
    .withMessage('Role must be either "customer" or "retailer".'),

  body('storeName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Store name must be under 100 characters.')
];

module.exports = {
  googleLoginRules,
  registerRules,
  loginRules,
  changePasswordRules
};
