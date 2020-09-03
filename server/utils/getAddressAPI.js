var config = require('../../server/config/config');
const axios = require('axios');

  const getAddressAPI = {

    getPostcodeData: async function(postcode) {
      try {
        const postcodeData = await axios.get(`https://api.getAddress.io/find/${postcode.replace(/ /g, '')}?api-key=${config.get('getAddress.apikey')}&expand=true`);
        return postcodeData.data;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
  };
module.exports.getAddressAPI = getAddressAPI;
