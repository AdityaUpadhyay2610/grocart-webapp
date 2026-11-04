const { query } = require('express-validator');
const config = require('../config/config');

const paginationRules = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: config.security.pagination.maxLimit })
    .withMessage(`Limit must be between 1 and ${config.security.pagination.maxLimit}.`),
  query('offset')
    .optional()
    .isInt({ min: 0, max: config.security.pagination.maxOffset })
    .withMessage(`Offset must be between 0 and ${config.security.pagination.maxOffset}.`),
  query('category')
    .optional()
    .isString()
    .trim()
];

module.exports = {
  paginationRules
};
