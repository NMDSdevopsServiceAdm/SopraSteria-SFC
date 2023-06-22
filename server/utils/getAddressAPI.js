const config = require('../../server/config/config');
const axios = require('axios');

module.exports = {
  getPostcodeData: async function (postcode) {
    console.log('#########################');
    console.log('***** getPostcodeData ******');
    try {
      const postcodeData = await axios.get(
        `https://api.getAddress.io/find/${postcode.replace(/ /g, '')}?api-key=${config.get(
          'getAddress.apikey',
        )}&expand=true`,
      );
      return postcodeData.data;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
};
