// server/src/middleware/validate.js
// Reads express-validator results and sends a 400 response if there are any errors.
// Place this middleware AFTER your validator rules in a route.

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorList = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    console.warn(`[Validation Error] ${req.method} ${req.originalUrl}:`, errorList);

    // The UI shows the first error message in the red error box,
    // so we use the first error as the top-level message too.
    return sendError(res, errorList[0].message, errorList, 400);
  }

  next();
}

module.exports = validate;
