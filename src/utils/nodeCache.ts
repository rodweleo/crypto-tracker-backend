// src/utils/cache.ts
import NodeCache from 'node-cache';

// Initialize cache with a default TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export default cache;
