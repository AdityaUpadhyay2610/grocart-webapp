// server/scripts/initDb.js
// Automatically creates the database if it doesn't exist and applies schema.sql.

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../src/config/config');

async function ensureDatabaseExists() {
  const url = new URL(config.db.url);
  const targetDb = url.pathname.replace(/^\//, '');

  if (!targetDb || targetDb === 'postgres') {
    return; // Already connecting to postgres default
  }

  // Connect to the default 'postgres' database to check/create the target database
  const maintenanceUrl = new URL(config.db.url);
  maintenanceUrl.pathname = '/postgres';

  const maintenancePool = new Pool({ connectionString: maintenanceUrl.toString() });

  try {
    const checkRes = await maintenancePool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDb]
    );

    if (checkRes.rowCount === 0) {
      console.log(`[InitDB] Database "${targetDb}" does not exist. Creating database...`);
      // Database names cannot be parameterized in CREATE DATABASE, validate alphanumeric/underscore
      if (!/^[a-zA-Z0-9_]+$/.test(targetDb)) {
        throw new Error(`[InitDB] Invalid database name: ${targetDb}`);
      }
      await maintenancePool.query(`CREATE DATABASE ${targetDb}`);
      console.log(`[InitDB] Database "${targetDb}" created successfully.`);
    }
  } catch (err) {
    console.warn(`[InitDB] Notice while checking database existence: ${err.message}`);
  } finally {
    await maintenancePool.end();
  }
}

async function initializeDatabase() {
  try {
    await ensureDatabaseExists();

    const targetPool = new Pool({ connectionString: config.db.url });

    console.log('[InitDB] Reading schema.sql...');
    const schemaPath = path.resolve(__dirname, '../sql/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[InitDB] Applying schema to database...');
    await targetPool.query(sql);
    console.log('[InitDB] ✅ All tables, indexes, and initial records created successfully!');

    await targetPool.end();
    process.exit(0);
  } catch (err) {
    console.error('[InitDB] ❌ Failed to apply schema:', err.message);
    process.exit(1);
  }
}

initializeDatabase();
