const config = require('../config/config');
const { sendError } = require('../utils/response');

function requireCookieRequestHeader(req, res, next) {
  const headerName = config.security.cookieRequestHeader;
  const headerValue = req.get(headerName);
  if (headerValue !== config.security.cookieRequestHeaderValue) {
    return sendError(res, config.security.cookieRequestHeaderMessage, [], 403);
  }

  next();
}

module.exports = requireCookieRequestHeader;
