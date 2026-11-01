class TokenBucket {
  constructor(capacity, refillPerSecond, now = Date.now()) {
    if (capacity <= 0 || refillPerSecond <= 0) {
      throw new Error('Token bucket capacity and refill rate must be positive.');
    }

    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.tokens = capacity;
    this.updatedAt = now;
  }

  consume(amount = 1, now = Date.now()) {
    const elapsedSeconds = Math.max(0, now - this.updatedAt) / 1000;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsedSeconds * this.refillPerSecond
    );
    this.updatedAt = now;

    if (this.tokens < amount) {
      return {
        allowed: false,
        retryAfter: (amount - this.tokens) / this.refillPerSecond
      };
    }

    this.tokens -= amount;
    return { allowed: true, retryAfter: 0 };
  }
}

module.exports = TokenBucket;
