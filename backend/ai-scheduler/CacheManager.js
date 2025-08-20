'use strict';

const crypto = require('crypto');

class CacheManager {
  constructor() {
    // Simple in-memory cache; can be replaced with Redis later
    this.cache = new Map();
  }

  static hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  keyFromObject(object) {
    const json = JSON.stringify(object);
    return CacheManager.hash(json);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const { value, expiresAt } = entry;
    if (expiresAt && Date.now() > expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return value;
  }

  set(key, value, ttlMs = 5 * 60 * 1000) {
    this.cache.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : null });
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = CacheManager;


