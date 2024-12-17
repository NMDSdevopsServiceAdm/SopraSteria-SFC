const config = require('../config/config');
const RedisClient = require('ioredis');

const redisClient = new RedisClient({ ...config.get('redis'), keyPrefix: 'findUserAccountAttempts:' });

const getNumberOfFailedAttempts = async (ipAddress) => {
  const rawValue = await redisClient.get(ipAddress);
  return rawValue ? Number(rawValue) : 0;
};

const recordFailedAttempt = async (ipAddress) => {
  const ttl = 24 * 60 * 60; // 24 hours
  const failedAttemptsSoFar = await redisClient.incr(ipAddress);
  await redisClient.expire(ipAddress, ttl);

  return failedAttemptsSoFar;
};

module.exports = { getNumberOfFailedAttempts, recordFailedAttempt };
