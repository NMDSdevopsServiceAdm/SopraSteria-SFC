const config = require('../../config/config');
const expressRateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const RedisClient = require('ioredis');
const isCI = require('is-ci');

const redisClient = new RedisClient(config.get('redis.url'));
const authStore = isCI
  ? undefined
  : new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });

const dbStore = isCI
  ? undefined
  : new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });

const rateLimiterConfig = {
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  passIfNotConnected: true,
  windowMs: 5000,
};

const authLimiter = isCI
  ? (req, res, next) => {
      next();
    }
  : expressRateLimit.rateLimit({
      ...rateLimiterConfig,
      store: authStore,
      limit: 1000,
      prefix: 'auth:',
    });

const dbLimiter = isCI
  ? (req, res, next) => {
      next();
    }
  : expressRateLimit.rateLimit({
      ...rateLimiterConfig,
      store: dbStore,
      limit: 1000,
      prefix: 'db:',
    });

module.exports.authLimiter = authLimiter;
module.exports.dbLimiter = dbLimiter;
