class LeakyBucket {
  constructor(capacity, leakPerSecond, now = Date.now()) {
    if (capacity <= 0 || leakPerSecond <= 0) {
      throw new Error('Leaky bucket capacity and leak rate must be positive.');
    }

    this.capacity = capacity;
    this.leakPerSecond = leakPerSecond;
    this.level = 0;
    this.updatedAt = now;
  }

  isFull(now = Date.now()) {
    this.leak(now);
    return this.level + 1 > this.capacity;
  }

  consume(now = Date.now()) {
    this.leak(now);
    if (this.level + 1 > this.capacity) {
      return {
        allowed: false,
        retryAfter: this.retryAfter()
      };
    }

    this.level += 1;
    return {
      allowed: true,
      full: this.level >= this.capacity,
      retryAfter: 0
    };
  }

  recordFailure(now = Date.now()) {
    this.leak(now);
    this.level = Math.min(this.capacity, this.level + 1);
    return this.level >= this.capacity;
  }

  retryAfter(now = Date.now()) {
    this.leak(now);
    return Math.max(0, (this.level - this.capacity + 1) / this.leakPerSecond);
  }

  leak(now) {
    const elapsedSeconds = Math.max(0, now - this.updatedAt) / 1000;
    this.level = Math.max(0, this.level - elapsedSeconds * this.leakPerSecond);
    this.updatedAt = now;
  }
}

module.exports = LeakyBucket;
