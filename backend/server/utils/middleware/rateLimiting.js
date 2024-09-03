const config = require('../../config/config');
const expressRateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const isCI = require('is-ci');

const store = isCI
  ? undefined
  : new RedisStore({
      redisURL: config.get('redis.url'),
    });

const rateLimiterConfig = {
  store,
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
      limit: 1000,
      prefix: 'auth:',
    });

const dbLimiter = isCI
  ? (req, res, next) => {
      next();
    }
  : expressRateLimit.rateLimit({
      ...rateLimiterConfig,
      limit: 1000,
      prefix: 'db:',
    });

module.exports.authLimiter = authLimiter;
module.exports.dbLimiter = dbLimiter;
