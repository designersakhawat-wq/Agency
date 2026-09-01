const Redis = require('ioredis');

/**
 * Enterprise Distributed Redis Client Configuration
 * Supports:
 * 1. Redis URL (e.g. redis://default:pass@host:port or rediss:// for TLS)
 * 2. Host / Port / Password individual configs (Upstash, AWS ElastiCache, DigitalOcean, Redis Cloud)
 * 3. Graceful offline fallback (never blocks app or throws uncaught startup exceptions)
 */

let redisClient = null;
let isRedisConnected = false;

const redisUrl = process.env.REDIS_URL || '';
const redisHost = process.env.REDIS_HOST || '';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const redisTls = process.env.REDIS_TLS === 'true' || redisUrl.startsWith('rediss://');

const isConfigured = Boolean(redisUrl || redisHost);

if (isConfigured) {
  try {
    const options = {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('⚠️ [Redis] Max reconnection attempts reached. Continuing in local L1 fallback mode.');
          return null;
        }
        return Math.min(times * 500, 2000);
      },
    };

    if (redisTls) {
      options.tls = { rejectUnauthorized: false };
    }

    if (redisUrl) {
      redisClient = new Redis(redisUrl, options);
    } else {
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        ...options,
      });
    }

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('⚡ [Redis] Connected to Distributed Cache Node successfully.');
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      console.warn(`⚠️ [Redis] Connection notice (${err.code || err.message}). Operating in fast in-memory L1 cache mode.`);
    });

    redisClient.on('close', () => {
      isRedisConnected = false;
    });

    // Attempt non-blocking connection
    redisClient.connect().catch(() => {
      // Handled by error listener
    });
  } catch (err) {
    console.warn('⚠️ [Redis] Client initialization warning:', err.message);
    redisClient = null;
  }
} else {
  console.log('ℹ️ [Cache] REDIS_URL not configured. Operating with high-speed In-Memory L1 Cache (Zero-Config Mode).');
}

module.exports = {
  redisClient,
  isRedisConnected: () => isRedisConnected && redisClient?.status === 'ready',
};
