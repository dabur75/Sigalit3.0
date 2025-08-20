'use strict';

// Simple script to make a request that will clear cache
const CacheManager = require('../ai-scheduler/CacheManager');

const cache = new CacheManager();
cache.clear();
console.log('✅ Cache cleared');