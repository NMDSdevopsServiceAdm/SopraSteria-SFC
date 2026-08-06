const config = require('../config/config');
const RedisClient = require('ioredis');

const redisClient = new RedisClient(config.get('redis.url'), { keyPrefix: 'userLogoutTime:' });

const getUserLastLogoutTime = async (username) => {
  if (!username) {
    return null;
  }
  try {
    const rawValue = await redisClient.get(username);
    return rawValue ? Number(rawValue) : null;
  } catch (err) {
    console.error('Error occurred when trying to get user last logout time from cache');
  }
};

const cacheUserLogoutTime = async (username) => {
  try {
    const loginTokenTTL = config.get('jwt.ttl.login');
    const ttlInSeconds = loginTokenTTL * 60;

    const epochTimestampInSecond = Math.floor(new Date().getTime() / 1000);

    await redisClient.set(username, epochTimestampInSecond, 'EX', ttlInSeconds);

    return epochTimestampInSecond;
  } catch (err) {
    console.error('Error occurred when trying to cache user logout timestamp');
  }
};

module.exports = { getUserLastLogoutTime, cacheUserLogoutTime };
