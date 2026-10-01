// server/src/config/config.js
// Single source of truth for all environment variables and secrets.
// Loads .env once and exports a frozen configuration object.

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

// Helper to check required non-empty string variables
function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`[Config Error] Missing required environment variable: ${key}`);
  }
  return value.trim();
}

// Helper to convert numeric variables safely
function parseNumber(key, defaultValue) {
  const raw = process.env[key];
  if (raw === undefined || raw === null || raw.trim() === '') {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`[Config Error] Missing required numeric environment variable: ${key}`);
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`[Config Error] Environment variable ${key} must be a valid number, received: "${raw}"`);
  }
  return parsed;
}

// 1. Read required values
const databaseUrl = requireEnv('DATABASE_URL');
const jwtAccessSecret = requireEnv('JWT_ACCESS_SECRET');
const jwtRefreshSecret = requireEnv('JWT_REFRESH_SECRET');
const clientUrl = requireEnv('CLIENT_URL');

// 2. Validate JWT secrets
if (jwtAccessSecret.length < 32) {
  throw new Error('[Config Error] JWT_ACCESS_SECRET must be at least 32 characters long.');
}
if (jwtRefreshSecret.length < 32) {
  throw new Error('[Config Error] JWT_REFRESH_SECRET must be at least 32 characters long.');
}
if (jwtAccessSecret === jwtRefreshSecret) {
  throw new Error('[Config Error] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.');
}

// 3. In production, prevent obvious placeholder secrets
if (isProduction) {
  const placeholders = ['replace-me', 'change-me', 'secret', 'password'];
  const isAccessPlaceholder = placeholders.some((p) => jwtAccessSecret.toLowerCase().includes(p));
  const isRefreshPlaceholder = placeholders.some((p) => jwtRefreshSecret.toLowerCase().includes(p));
  if (isAccessPlaceholder || isRefreshPlaceholder) {
    throw new Error('[Config Error] Cannot use placeholder JWT secrets in production.');
  }
}

// 4. Parse numbers and defaults
const port = parseNumber('PORT', 5000);
const bcryptRounds = parseNumber('BCRYPT_ROUNDS', 12);
const accessExpires = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const refreshExpiresDays = parseNumber('REFRESH_TOKEN_EXPIRES_DAYS', 7);

const authRateLimitWindow = parseNumber('AUTH_RATE_LIMIT_WINDOW_MINUTES', 15);
const authRateLimitMax = parseNumber('AUTH_RATE_LIMIT_MAX', 10);
const refreshRateLimitWindow = parseNumber('REFRESH_RATE_LIMIT_WINDOW_MINUTES', 15);
const refreshRateLimitMax = parseNumber('REFRESH_RATE_LIMIT_MAX', 60);
const generalRateLimitWindow = parseNumber('GENERAL_RATE_LIMIT_WINDOW_MINUTES', 1);
const generalRateLimitMax = parseNumber('GENERAL_RATE_LIMIT_MAX', 300);

// 5. Cookie settings derived from environment
const cookieSettings = {
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax'
};

// 6. Seed admin settings (used by scripts/seed.js)
const seedAdmin = {
  name: process.env.SEED_ADMIN_NAME || 'Admin',
  email: process.env.SEED_ADMIN_EMAIL || '',
  password: process.env.SEED_ADMIN_PASSWORD || ''
};

// Export one frozen object
module.exports = Object.freeze({
  env,
  isProduction,
  port,
  clientUrl,
  db: {
    url: databaseUrl
  },
  jwt: {
    accessSecret: jwtAccessSecret,
    refreshSecret: jwtRefreshSecret,
    accessExpires,
    refreshExpiresDays
  },
  cookie: cookieSettings,
  security: {
    bcryptRounds,
    authRateLimit: {
      windowMinutes: authRateLimitWindow,
      max: authRateLimitMax
    },
    refreshRateLimit: {
      windowMinutes: refreshRateLimitWindow,
      max: refreshRateLimitMax
    },
    generalRateLimit: {
      windowMinutes: generalRateLimitWindow,
      max: generalRateLimitMax
    }
  },
  seedAdmin
});
