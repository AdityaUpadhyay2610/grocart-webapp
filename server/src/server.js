// Server entry point. Tests database connection and starts HTTP server.

const app = require('./app');
const config = require('./config/config');
const db = require('./config/db');
const logger = require('./utils/logger');

async function startServer() {
  let server;
  let refreshTokenCleanupTimer;

  try {
    logger.info('[Server] Connecting to PostgreSQL database...');
    await db.query('SELECT 1');
    logger.info('[Server] PostgreSQL connection established successfully.');

    const cleanupExpiredRefreshTokens = async () => {
      try {
        const result = await db.query(
          'DELETE FROM refresh_tokens WHERE expires_at <= NOW()'
        );
        if (result.rowCount > 0) {
          logger.info(`Removed ${result.rowCount} expired refresh tokens.`);
        }
      } catch (error) {
        logger.error('Expired refresh-token cleanup failed:', error.message);
      }
    };

    await cleanupExpiredRefreshTokens();
    refreshTokenCleanupTimer = setInterval(
      cleanupExpiredRefreshTokens,
      config.security.refreshTokenCleanupIntervalMs
    );
    refreshTokenCleanupTimer.unref();

    server = app.listen(config.port, () => {
      logger.info(`[Server] GroCart backend running in "${config.env}" mode on port ${config.port}`);
    });

    const shutdown = async (signal) => {
      logger.info(`[Server] Received ${signal}. Shutting down gracefully...`);
      clearInterval(refreshTokenCleanupTimer);
      server.close(async () => {
        try {
          await db.pool.end();
          logger.info('[Server] Database pool closed.');
          process.exit(0);
        } catch (err) {
          logger.error('[Server] Error closing pool:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('[Server Startup Failure]:', error.message);
    process.exit(1);
  }
}

startServer();
