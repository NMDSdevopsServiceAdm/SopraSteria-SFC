const { pRateLimit } = require('p-ratelimit');

const limit = pRateLimit({
      interval: 1000,
      rate: 15, // 5 emails per second
});

exports.limit = limit;
