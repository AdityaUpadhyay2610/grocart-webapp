const config = require('../config/config');
const { verifyAccessToken } = require('../utils/tokens');
const TokenBucket = require('../utils/tokenBucket');
const LeakyBucket = require('../utils/leakyBucket');
const store = require('../utils/rateLimitStore');
const { sendError } = require('../utils/response');

function getClientIp(req) {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function getUserId(req) {
  if (req.user?.id) {
    return req.user.id;
  }

  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    return null;
  }

  try {
    return verifyAccessToken(authorization.slice(7)).sub || null;
  } catch {
    return null;
  }
}

function getBucket(key, createBucket) {
  let bucket = store.get(key);
  if (!bucket) {
    bucket = createBucket();
    store.set(key, bucket);
  }
  return bucket;
}

function rejectRequest(res, message, retryAfter) {
  res.set('Retry-After', String(Math.max(1, Math.ceil(retryAfter))));
  return sendError(res, message, [], 429);
}

function createTokenBucketLimiter({
  name,
  capacity,
  refillPerSecond,
  windowMs,
  keyGenerator,
  message = config.security.rateLimitMessage
}) {
  return function tokenBucketLimiter(req, res, next) {
    const bucketKey = `${name}:${keyGenerator(req)}`;
    const bucket = getBucket(
      bucketKey,
      () => new TokenBucket(capacity, refillPerSecond)
    );
    const result = bucket.consume();

    if (!result.allowed) {
      return rejectRequest(res, message, result.retryAfter);
    }

    const bucketLifetime = Math.max(windowMs, capacity / refillPerSecond * 1000);
    store.set(bucketKey, bucket, Date.now() + bucketLifetime);
    next();
  };
}

function createLeakyBucketLimiter({
  name,
  capacity,
  windowMs,
  keyGenerator,
  message = config.security.rateLimitMessage
}) {
  const leakPerSecond = capacity / (windowMs / 1000);
  return function leakyBucketLimiter(req, res, next) {
    const bucketKey = `${name}:${keyGenerator(req)}`;
    const bucket = getBucket(
      bucketKey,
      () => new LeakyBucket(capacity, leakPerSecond)
    );
    const result = bucket.consume();

    if (!result.allowed) {
      return rejectRequest(res, message, result.retryAfter);
    }

    store.set(bucketKey, bucket, Date.now() + windowMs);
    next();
  };
}

function createLoginLimiter() {
  const emailConfig = config.security.loginRateLimit.email;
  const ipConfig = config.security.loginRateLimit.ip;
  const emailLeakPerSecond = emailConfig.capacity / (emailConfig.windowMs / 1000);
  const ipLeakPerSecond = ipConfig.capacity / (ipConfig.windowMs / 1000);

  return function loginLimiter(req, res, next) {
    const email = String(req.body.email || '').trim().toLowerCase();
    const ip = getClientIp(req);
    const now = Date.now();
    const lockKey = `login:lock:${email}`;
    const lock = email ? store.get(lockKey) : null;

    if (lock && lock.lockedUntil > now) {
      return rejectRequest(
        res,
        config.security.loginRateLimit.lockMessage,
        (lock.lockedUntil - now) / 1000
      );
    }
    if (lock) {
      store.delete(lockKey);
    }

    const emailBucket = email
      ? getBucket(
        `login:email:${email}`,
        () => new LeakyBucket(emailConfig.capacity, emailLeakPerSecond)
      )
      : null;
    const ipBucket = getBucket(
      `login:ip:${ip}`,
      () => new LeakyBucket(ipConfig.capacity, ipLeakPerSecond)
    );

    if (emailBucket?.isFull(now)) {
      const lockedUntil = now + config.security.loginRateLimit.lockMs;
      store.set(lockKey, { lockedUntil }, lockedUntil);
      return rejectRequest(
        res,
        config.security.loginRateLimit.lockMessage,
        config.security.loginRateLimit.lockMs / 1000
      );
    }
    if (ipBucket.isFull(now)) {
      return rejectRequest(
        res,
        config.security.rateLimitMessage,
        ipBucket.retryAfter(now)
      );
    }

    res.on('finish', () => {
      if (res.statusCode !== 401) {
        return;
      }

      const failureTime = Date.now();
      const emailLimitReached = emailBucket?.recordFailure(failureTime) || false;
      ipBucket.recordFailure(failureTime);
      if (emailBucket) {
        store.set(
          `login:email:${email}`,
          emailBucket,
          failureTime + emailConfig.windowMs
        );
      }
      store.set(`login:ip:${ip}`, ipBucket, failureTime + ipConfig.windowMs);
      if (emailLimitReached && email) {
        const lockedUntil = failureTime + config.security.loginRateLimit.lockMs;
        store.set(lockKey, { lockedUntil }, lockedUntil);
      }
    });

    next();
  };
}

const byUserOrIp = (req) => getUserId(req) || getClientIp(req);

module.exports = {
  // Applied globally to all requests
  generalLimiter: createTokenBucketLimiter({
    name: 'general',
    ...config.security.generalRateLimit,
    keyGenerator: byUserOrIp
  }),

  // Public catalog reads — token bucket, generous for browsing
  searchLimiter: createTokenBucketLimiter({
    name: 'search',
    ...config.security.searchRateLimit,
    keyGenerator: byUserOrIp
  }),

  // Auth routes
  refreshLimiter: createTokenBucketLimiter({
    name: 'refresh',
    ...config.security.refreshRateLimit,
    keyGenerator: byUserOrIp
  }),
  loginLimiter: createLoginLimiter(),
  registerLimiter: createLeakyBucketLimiter({
    name: 'register',
    ...config.security.registerRateLimit,
    keyGenerator: getClientIp
  }),

  // Order placement
  orderLimiter: createTokenBucketLimiter({
    name: 'order',
    ...config.security.orderRateLimit,
    keyGenerator: byUserOrIp
  }),

  // Profile updates
  profileLimiter: createTokenBucketLimiter({
    name: 'profile',
    ...config.security.profileRateLimit,
    keyGenerator: byUserOrIp
  }),

  // Cart mutations — token bucket per user
  cartLimiter: createTokenBucketLimiter({
    name: 'cart',
    ...config.security.cartRateLimit,
    keyGenerator: byUserOrIp
  }),

  // Coupon validation — leaky bucket to stop brute-force code guessing
  couponLimiter: createLeakyBucketLimiter({
    name: 'coupon',
    ...config.security.couponRateLimit,
    keyGenerator: byUserOrIp
  }),

  // Bulk import — leaky bucket, slow drain (expensive DB write operation)
  bulkUploadLimiter: createLeakyBucketLimiter({
    name: 'bulk',
    ...config.security.bulkUploadRateLimit,
    keyGenerator: byUserOrIp
  }),
};
