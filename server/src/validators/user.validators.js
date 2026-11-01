// server/src/validators/user.validators.js
// express-validator rules for user profile update (PUT /users/me).

const { body } = require('express-validator');
const config = require('../config/config');

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

  body('avatarUrl')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) {
        return true;
      }

      const match = value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/i);
      if (!match) {
        throw new Error(config.security.avatarValidationMessage);
      }

      const encodedImage = match[2];
      const decodedImage = Buffer.from(encodedImage, 'base64');
      if (
        encodedImage.length % 4 !== 0 ||
        decodedImage.toString('base64') !== encodedImage ||
        decodedImage.length > config.security.avatarMaxBytes
      ) {
        throw new Error(config.security.avatarValidationMessage);
      }

      return true;
    })
];

module.exports = { updateProfileRules };
