const models = require('../../models/');
const { RateLimiterPostgres } = require('rate-limiter-flexible');
const appConfig = require('../../config/config');

const opts = {
  points: appConfig.get('rateLimiting.points'),
  duration: appConfig.get('rateLimiting.duration'),
  storeClient: models.sequelize,
  tableName: appConfig.get('rateLimiting.table'),
  keyPrefix: 'UsernameLookup',
};

const ready = (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Created/Found table needed for rate limiting');
  }
};

const rateLimiter = new RateLimiterPostgres(opts, ready);

exports.rateLimiting = (req, res, next) => {
  rateLimiter
    .consume(req.ip, 1)
    .then((rateLimiterRes) => {
      const headers = {
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
        'X-RateLimit-Limit': opts.points,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      };
      res.set(headers);
      next();
    })
    .catch(() => {
      res.status(429).send('Too Many Requests');
    });
};
