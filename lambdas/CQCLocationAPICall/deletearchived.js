const axios = require('axios');
const axiosRetry = require('axios-retry');
const { ConcurrencyManager } = require('axios-concurrency');
const models = require('./models/index');
// 52679

// CQC Endpoint
const url = 'https://api.cqc.org.uk/public/v1';
axiosRetry(axios, { retries: 3 });
// Exponential back-off retry delay between requests
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });
// Custom retry delay
axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});
let changes = 0;
const api = axios.create({
  baseURL: url,
  rejectUnauthorized: false,
});
const MAX_CONCURRENT_REQUESTS = 10;
const manager = ConcurrencyManager(api, MAX_CONCURRENT_REQUESTS);

async function getLocation(location) {
  try {
    const individualLocation = await api.get('/locations/' + location.locationid);
    changes++;
    if (changes % 100 === 0) {
      console.log(`Checked ${changes} so far`);
    }
    if (individualLocation.data.deregistrationDate) {
      try {
        console.log(`${location.locationid} is no longer active, deleting from database.`);
        await models.location.destroy({
          where: {
            locationid: location.locationid,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}
module.exports.handler = async () => {
  const locations = await models.location.findAll({
    attributes: ['locationid'],
  });
  if (locations) {
    await Promise.all(
      locations.map(async (location) => {
        await getLocation(location);
        manager.detach();
      }),
    );
  }
};
