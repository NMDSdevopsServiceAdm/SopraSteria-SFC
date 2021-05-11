const axios = require('axios');

module.exports = {
  getWorkplaceCQCData: async function (locationID) {
    try {
      const { data } = await axios.get('https://api.cqc.org.uk/public/v1/locations/' + locationID);

      return data;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
};
