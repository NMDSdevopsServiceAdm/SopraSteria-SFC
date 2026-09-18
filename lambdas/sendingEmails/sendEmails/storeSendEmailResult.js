const config = require('./config/config');
const RedisClient = require('ioredis');

const redisClient = new RedisClient(config.get('redis.url'), { keyPrefix: 'brevoEmailStatus:' });

const loadSendEmailResult = async () => {
  try {
    const dateOfToday = new Date().toISOString().slice(0, 10);

    const results = await redisClient.lrange(dateOfToday, 0, -1);

    return results.map((result) => JSON.parse(result));
  } catch (err) {
    console.error('Error occurred when trying to load the send email result');
    console.error(err);
  }
};

const storeSendEmailResult = async (responseContent) => {
  try {
    const oneWeek = 60 * 60 * 24 * 7;
    const timestamp = new Date().toISOString();
    const dateOfToday = timestamp.slice(0, 10);
    const stringifiedContent = JSON.stringify({ ...responseContent, timestamp });

    await redisClient.rpush(dateOfToday, stringifiedContent);

    await redisClient.set(url, stringifiedContent, 'EX', oneWeek);
  } catch (err) {
    console.error('Error occurred when trying to store the send email result');
    console.error(err);
  }
};

module.exports = { loadSendEmailResult, storeSendEmailResult };
