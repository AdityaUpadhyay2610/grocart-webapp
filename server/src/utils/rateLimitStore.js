const config = require('../config/config');

class RateLimitStore {
  constructor(cleanupIntervalMs, idleTimeoutMs) {
    this.entries = new Map();
    this.idleTimeoutMs = idleTimeoutMs;
    this.cleanupTimer = setInterval(
      () => this.clearExpiredEntries(),
      cleanupIntervalMs
    );
    this.cleanupTimer.unref();
  }

  get(key) {
    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }

    entry.lastAccessedAt = Date.now();
    return entry.value;
  }

  set(key, value, expiresAt = null) {
    this.entries.set(key, {
      value,
      expiresAt,
      lastAccessedAt: Date.now()
    });
  }

  delete(key) {
    this.entries.delete(key);
  }

  clearExpiredEntries(now = Date.now()) {
    for (const [key, entry] of this.entries) {
      const expiredByTime = entry.expiresAt !== null
        ? entry.expiresAt <= now
        : now - entry.lastAccessedAt >= this.idleTimeoutMs;
      if (expiredByTime) {
        this.entries.delete(key);
      }
    }
  }
}

module.exports = new RateLimitStore(
  config.security.rateLimitStore.cleanupIntervalMs,
  config.security.rateLimitStore.idleTimeoutMs
);
