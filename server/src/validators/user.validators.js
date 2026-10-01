// server/src/validators/user.validators.js
// express-validator rules for user profile update (PUT /users/me).

const { body } = require('express-validator');

// All fields are optional on update — only validate what's present.
const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters.'),

  body('storeName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Store name must be under 100 characters.'),

  body('phoneNumber')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number must be under 30 characters.'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be under 500 characters.'),

  body('avatarStyle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Avatar style must be under 100 characters.'),

  body('avatarSeed')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Avatar seed must be under 100 characters.'),

  // avatarUrl can be a base64 data URL (several hundred KB) or a regular URL.
  body('avatarUrl')
    .optional()
    .trim()
    .isLength({ max: 1500000 })
    .withMessage('Avatar URL is too large.')
    .custom((value) => {
      if (value && !value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('data:image/')) {
        throw new Error('Avatar URL must start with http://, https://, or data:image/');
      }
      return true;
    })
];

module.exports = { updateProfileRules };
