
const config = require('../../config/config');
const RateLimit = require('express-rate-limit');
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
  windowMs: 60 * 1000,  // 1 minute
};

const authLimiter = isCI
  ? (req, res, next) => {
      next();
    }
  : new RateLimit({
      ...rateLimiterConfig,
      max: 100, // maximum number of requests allowed in the windowMs
      prefix: 'auth:',
    });



module.exports.authLimiter = authLimiter;

