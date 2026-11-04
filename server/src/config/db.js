// PostgreSQL connection pool and query helpers.
// Handles standard queries and client checkout for multi-step transactions.

const { Pool } = require('pg');
const config = require('./config');
const logger = require('../utils/logger');

// Create connection pool with connection string from frozen config
const pool = new Pool({
  connectionString: config.db.url,
  max: config.db.pool.max,
  min: config.db.pool.min,
  idleTimeoutMillis: config.db.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.pool.connectionTimeoutMillis
});

// Log any unexpected pool errors
pool.on('error', (err) => {
  logger.error('[PostgreSQL Pool Error]:', err.message);
});

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} params - Array of parameter values
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // In development, log slow queries (> 200ms)
  if (!config.isProduction && duration > 2000) {
    logger.warn(`[Slow Query ${duration}ms]:`, text);
  }
  return res;
}

/**
 * Acquire a dedicated client for transactions (BEGIN / COMMIT / ROLLBACK)
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = {
  pool,
  query,
  getClient
};
