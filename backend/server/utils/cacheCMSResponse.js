const config = require('../config/config');
const RedisClient = require('ioredis');

const redisClient = new RedisClient(config.get('redis.url'), { keyPrefix: 'CMSCache:' });

const getCMSResponseFromCache = async (url) => {
  if (!url) {
    return null;
  }

  try {
    const cachedResponse = await redisClient.get(url);
    return JSON.parse(cachedResponse);
  } catch (err) {
    console.error('Error occurred when trying to get CMS content from cache');
  }
};

const cacheCMSResponse = async (url, responseContent) => {
  try {
    const oneDay = 60 * 60 * 24;
    const stringifiedContent = JSON.stringify(responseContent);

    await redisClient.set(url, stringifiedContent, 'EX', oneDay);
  } catch (err) {
    console.error('Error occurred when trying to cache CMS content');
  }
};

module.exports = { getCMSResponseFromCache, cacheCMSResponse };
