const axios = require('axios');
const config = require('../config/config');

const cqcEndpoint = String(config.get('cqcApi.url'));
const cqcSubscriptionKey = String(config.get('cqcApi.subscriptionKey'));

module.exports = {
  getWorkplaceCQCData: async function (locationID) {
    const { data } = await axios.get(cqcEndpoint + '/locations/' + locationID, {
      headers: { 'Ocp-Apim-Subscription-Key': cqcSubscriptionKey },
    });

    return data;
  },

  getCQCProviderData: async function (locationID) {
    const regex = new RegExp('^[0-9 -]{1,}$', 'gm');
    let isCorrectFormat = regex.test(locationID);

    if (isCorrectFormat) {
      const { data } = await axios.get(cqcEndpoint + '/providers/' + locationID, {
        headers: { 'Ocp-Apim-Subscription-Key': cqcSubscriptionKey },
      });
      return data;
    }
    return {};
  },
};
