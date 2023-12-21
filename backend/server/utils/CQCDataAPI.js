const axios = require('axios');

module.exports = {
  getWorkplaceCQCData: async function (locationID) {
    const { data } = await axios.get(
      'https://api.cqc.org.uk/public/v1/locations/' + locationID + '?partnerCode=SkillsForCare',
    );

    return data;
  },
};
