const config = require('../../../../config/config');
const RedisClient = require('ioredis');
const lodash = require('lodash');

const redisClient = new RedisClient(config.get('redis.url'), { keyPrefix: 'brevoEmailStatus:', connectTimeout: 5000 });

const loadSendEmailsResult = async () => {
  try {
    const timestamp = new Date().toISOString();
    const dateOfToday = timestamp.slice(0, 10);

    const storedResults = await redisClient.lrange(dateOfToday, 0, -1);
    const parsed = storedResults.map((result) => JSON.parse(result));
    const grouped = lodash.chain(parsed).groupBy('result').value();

    const result = {
      timestamp,
      date: dateOfToday,
      successful: grouped?.successful ?? [],
      successfulCount: grouped?.successful?.length ?? 0,
      failed: grouped?.failed ?? [],
      failedCount: grouped?.failed?.length ?? 0,
    };

    return result;
  } catch (err) {
    console.error('Error occurred when trying to load the send email result');
    console.error(err);
    return {};
  }
};

module.exports = { loadSendEmailsResult };
