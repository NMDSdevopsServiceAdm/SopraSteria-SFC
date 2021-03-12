const config = require('../../config/config');
const RateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const limiter = new RateLimit({
  store: new RedisStore({
    redisURL: config.get('redis.url'),
  }),
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  passIfNotConnected: true,
});

module.exports.limiter = limiter;
