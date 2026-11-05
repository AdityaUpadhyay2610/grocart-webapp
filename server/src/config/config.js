const path = require('path');
const dotenv = require('dotenv');
const {
  JWT_ALGORITHM,
  COOKIE_REQUEST_HEADER,
  COOKIE_REQUEST_HEADER_VALUE
} = require('./constants');

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
const jwtIssuer = process.env.JWT_ISSUER || 'grocart-api';
const jwtAudience = process.env.JWT_AUDIENCE || 'grocart-web';
const logLevel = process.env.LOG_LEVEL || 'info';

const trustProxy = parseNumber('TRUST_PROXY', isProduction ? 1 : 0);
const rateLimitStore = {
  cleanupIntervalMs: parseNumber('RATE_LIMIT_STORE_CLEANUP_INTERVAL_MS', 60000),
  idleTimeoutMs: parseNumber('RATE_LIMIT_STORE_IDLE_TIMEOUT_MS', 3600000)
};
const generalRateLimit = {
  capacity: parseNumber('API_RATE_LIMIT_CAPACITY', 3000),
  refillPerSecond: parseNumber('API_RATE_LIMIT_REFILL_PER_SECOND', 30),
  windowMs: parseNumber('API_RATE_LIMIT_WINDOW_SECONDS', 60) * 1000
};
const refreshRateLimit = {
  capacity: parseNumber('REFRESH_RATE_LIMIT_CAPACITY', 60),
  refillPerSecond: parseNumber('REFRESH_RATE_LIMIT_REFILL_PER_SECOND', 1),
  windowMs: parseNumber('REFRESH_RATE_LIMIT_WINDOW_SECONDS', 60) * 1000
};
const orderRateLimit = {
  capacity: parseNumber('ORDER_RATE_LIMIT_CAPACITY', 5),
  refillPerSecond: parseNumber('ORDER_RATE_LIMIT_REFILL_PER_SECOND', 0.1),
  windowMs: parseNumber('ORDER_RATE_LIMIT_WINDOW_SECONDS', 60) * 1000
};
const profileRateLimit = {
  capacity: parseNumber('PROFILE_RATE_LIMIT_CAPACITY', 10),
  refillPerSecond: parseNumber('PROFILE_RATE_LIMIT_REFILL_PER_SECOND', 0.2),
  windowMs: parseNumber('PROFILE_RATE_LIMIT_WINDOW_SECONDS', 60) * 1000
};
const loginEmailRateLimit = {
  capacity: parseNumber('LOGIN_EMAIL_FAILURE_CAPACITY', 5),
  windowMs: parseNumber('LOGIN_EMAIL_FAILURE_WINDOW_MINUTES', 15) * 60 * 1000
};
const loginIpRateLimit = {
  capacity: parseNumber('LOGIN_IP_FAILURE_CAPACITY', 20),
  windowMs: parseNumber('LOGIN_IP_FAILURE_WINDOW_MINUTES', 15) * 60 * 1000
};
const loginRateLimit = {
  email: loginEmailRateLimit,
  ip: loginIpRateLimit,
  lockMs: parseNumber('LOGIN_EMAIL_LOCK_MINUTES', 15) * 60 * 1000,
  lockMessage: process.env.LOGIN_LOCK_MESSAGE || 'Too many failed sign-in attempts. Try again later.'
};
const registerRateLimit = {
  capacity: parseNumber('REGISTER_RATE_LIMIT_CAPACITY', 5),
  windowMs: parseNumber('REGISTER_RATE_LIMIT_WINDOW_MINUTES', 60) * 60 * 1000
};

const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
if (googleClientId && !/^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(googleClientId)) {
  throw new Error('[Config Error] GOOGLE_CLIENT_ID does not look like a Google OAuth client id.');
}
const googleRateLimit = {
  capacity: parseNumber('GOOGLE_RATE_LIMIT_CAPACITY', 10),
  windowMs: parseNumber('GOOGLE_RATE_LIMIT_WINDOW_MINUTES', 15) * 60 * 1000
};

const searchRateLimit = {
  capacity: parseNumber('SEARCH_RATE_LIMIT_CAPACITY', 120),
  refillPerSecond: parseNumber('SEARCH_RATE_LIMIT_REFILL_PER_SECOND', 2),
  windowMs: parseNumber('SEARCH_RATE_LIMIT_WINDOW_SECONDS', 60) * 1000
};
const cartRateLimit = {
  capacity: parseNumber('CART_RATE_LIMIT_CAPACITY', 60),
  refillPerSecond: parseNumber('CART_RATE_LIMIT_REFILL_PER_SECOND', 1),
  windowMs: parseNumber('CART_RATE_LIMIT_WINDOW_SECONDS', 60) * 1000
};
const couponRateLimit = {
  capacity: parseNumber('COUPON_RATE_LIMIT_CAPACITY', 10),
  windowMs: parseNumber('COUPON_RATE_LIMIT_WINDOW_MINUTES', 5) * 60 * 1000
};
const bulkUploadRateLimit = {
  capacity: parseNumber('BULK_UPLOAD_RATE_LIMIT_CAPACITY', 3),
  windowMs: parseNumber('BULK_UPLOAD_RATE_LIMIT_WINDOW_MINUTES', 60) * 60 * 1000
};
const refreshTokenCleanupIntervalMs =
  parseNumber('REFRESH_TOKEN_CLEANUP_INTERVAL_MINUTES', 60) * 60 * 1000;
const bodyLimits = {
  json: process.env.JSON_BODY_LIMIT || '100kb',
  profileJson: process.env.PROFILE_JSON_BODY_LIMIT || '3mb'
};
const pagination = {
  defaultLimit: parseNumber('PAGINATION_DEFAULT_LIMIT', 5000),
  maxLimit: parseNumber('PAGINATION_MAX_LIMIT', 10000),
  maxOffset: parseNumber('PAGINATION_MAX_OFFSET', 1000000)
};
const avatarMaxBytes = parseNumber('AVATAR_MAX_BYTES', 1048576);
const authMessages = {
  invalidCredentials:
    process.env.AUTH_INVALID_CREDENTIALS_MESSAGE || 'Invalid email or password.',
  registrationNeutral:
    process.env.REGISTRATION_NEUTRAL_MESSAGE ||
    'If this email can be registered, the request has been accepted.'
};
const allowedLogLevels = ['error', 'warn', 'info', 'debug'];
if (!allowedLogLevels.includes(logLevel)) {
  throw new Error(`LOG_LEVEL must be one of: ${allowedLogLevels.join(', ')}.`);
}

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

// 7. Razorpay configuration
const razorpay = {
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
};

// Export one frozen object
module.exports = Object.freeze({
  env,
  isProduction,
  port,
  clientUrl,
  trustProxy,
  logLevel,
  db: {
    url: databaseUrl,
    pool: {
      max: parseNumber('DB_POOL_MAX', 20),
      min: parseNumber('DB_POOL_MIN', 2),
      idleTimeoutMillis: parseNumber('DB_POOL_IDLE_TIMEOUT_MS', 30000),
      connectionTimeoutMillis: parseNumber('DB_POOL_CONNECT_TIMEOUT_MS', 5000)
    }
  },
  jwt: {
    accessSecret: jwtAccessSecret,
    refreshSecret: jwtRefreshSecret,
    accessExpires,
    refreshExpiresDays,
    algorithm: JWT_ALGORITHM,
    issuer: jwtIssuer,
    audience: jwtAudience,
    verifyOptions: Object.freeze({
      algorithms: [JWT_ALGORITHM],
      issuer: jwtIssuer,
      audience: jwtAudience
    })
  },
  cookie: cookieSettings,
  security: {
    bcryptRounds,
    authMessages,
    bodyLimits,
    pagination,
    avatarMaxBytes,
    avatarValidationMessage:
      process.env.AVATAR_VALIDATION_MESSAGE ||
      'Avatar must be a png, jpeg, or webp image within the configured size limit.',
    productImageValidationMessage:
      process.env.PRODUCT_IMAGE_VALIDATION_MESSAGE ||
      'Product images must use HTTPS or a local public path.',
    rateLimitMessage: process.env.RATE_LIMIT_MESSAGE || 'Too many requests. Please try again later.',
    rateLimitStore,
    generalRateLimit,
    searchRateLimit,
    refreshRateLimit,
    orderRateLimit,
    profileRateLimit,
    cartRateLimit,
    couponRateLimit,
    bulkUploadRateLimit,
    loginRateLimit,
    registerRateLimit,
    googleRateLimit,
    refreshTokenCleanupIntervalMs,
    cookieRequestHeader: COOKIE_REQUEST_HEADER,
    cookieRequestHeaderValue: COOKIE_REQUEST_HEADER_VALUE,
    cookieRequestHeaderMessage:
      process.env.COOKIE_REQUEST_HEADER_MESSAGE || 'A custom request header is required.'
  },
  google:{
    clientId: googleClientId,
    enabled: googleClientId !== '',
    nonceCookie: 'g_nonce',
    nonceTtlMs: 5*60*1000
  },
  seedAdmin,
  razorpay
});