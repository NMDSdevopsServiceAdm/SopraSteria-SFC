const config = require('../../config/config');
const expressRateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const RedisClient = require('ioredis');
const isCI = require('is-ci');

const redisClient = new RedisClient(config.get('redis.url'));
const store = isCI
  ? undefined
  : new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });

const rateLimiterConfig = {
  store,
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  passIfNotConnected: true,
  windowMs: 60 * 1000, // 1 minute
};

const nhsBsaApiLimiter = isCI
  ? (req, res, next) => {
      next();
    }
  : expressRateLimit.rateLimit({
      ...rateLimiterConfig,
      limit: 200, // maximum number of requests allowed in the windowMs
      prefix: 'nhsBsaApi:',
    });

module.exports.nhsBsaApiLimiter = nhsBsaApiLimiter;
