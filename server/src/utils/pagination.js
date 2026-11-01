const config = require('../config/config');

function getPagination(query) {
  const limit = query.limit === undefined
    ? config.security.pagination.defaultLimit
    : Number(query.limit);
  const offset = query.offset === undefined ? 0 : Number(query.offset);

  return { limit, offset };
}

module.exports = getPagination;
