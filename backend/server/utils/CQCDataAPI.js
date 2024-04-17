const axios = require('axios');
const config = require('../config/config');

const cqcEndpoint = config.get('cqcApi.url');
const cqcSubscriptionKey = config.get('cqcApi.subscriptionKey');

module.exports = {
  getWorkplaceCQCData: async function (locationID) {
    const { data } = await axios.get(cqcEndpoint + '/locations/' + locationID, {
      headers: { 'Ocp-Apim-Subscription-Key': cqcSubscriptionKey },
    });

    return data;
  },
};
