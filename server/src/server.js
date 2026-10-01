// server/src/server.js
// Server entry point. Tests database connection and starts HTTP server.

const app = require('./app');
const config = require('./config/config');
const db = require('./config/db');

async function startServer() {
  try {
    // Verify database connectivity
    console.log('[Server] Connecting to PostgreSQL database...');
    await db.query('SELECT 1');
    console.log('[Server] PostgreSQL connection established successfully.');

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`[Server] GroCart backend running in "${config.env}" mode on port ${config.port}`);
      console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await db.pool.end();
          console.log('[Server] Database pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('[Server] Error closing pool:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server Startup Failure]:', err.message);
    process.exit(1);
  }
}

startServer();
