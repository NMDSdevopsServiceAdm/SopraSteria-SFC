const AWS = require('aws-sdk');
const appConfig = require('./config/config');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const models = require('./models/index');
// 52679

// CQC Endpoint
const url = 'https://api.cqc.org.uk/public/v1';
axiosRetry(axios, { retries: 3 });
let changes = 0;

async function getLocation (location) {
  try {
    const individualLocation = await axios.get(url + '/locations/' + location.locationid);
    changes++;
    if (changes % 100 === 0) {
      console.log(`Checked ${changes} so far`);
    }
    if (individualLocation.data.deregistrationDate) {
      try {
        console.log(`${location.locationid} is no longer active, deleting from database.`);
        await models.location.destroy({
          where: {
            locationid: location.locationid
          }
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
    attributes: ['locationid']
  });
  if (locations) {
    await Promise.all(locations.map(async location => {
      await getLocation(location);
    }));
  }
};
