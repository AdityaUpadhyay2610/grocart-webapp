// server/src/config/db.js
// PostgreSQL connection pool and query helpers.
// Handles standard queries and client checkout for multi-step transactions.

const { Pool } = require('pg');
const config = require('./config');

// Create connection pool with connection string from frozen config
const pool = new Pool({
  connectionString: config.db.url
});

// Log any unexpected pool errors
pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
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
  if (!config.isProduction && duration > 200) {
    console.warn(`[Slow Query ${duration}ms]:`, text);
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
