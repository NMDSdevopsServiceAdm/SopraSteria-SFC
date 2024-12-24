const config = require('../config/config');
const RedisClient = require('ioredis');

const redisClient = new RedisClient({ ...config.get('redis'), keyPrefix: 'findUserAccountAttempts:' });

const getNumberOfFailedAttempts = async (ipAddress) => {
  const rawValue = await redisClient.get(ipAddress);
  return rawValue ? Number(rawValue) : 0;
};

const recordFailedAttempt = async (ipAddress) => {
  const ttl = 60 * 60; // 1 hour
  const failedAttemptsCount = await redisClient.incr(ipAddress);
  await redisClient.expire(ipAddress, ttl);

  return failedAttemptsCount;
};

module.exports = { getNumberOfFailedAttempts, recordFailedAttempt };
