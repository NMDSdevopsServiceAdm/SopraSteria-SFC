const axios = require('axios');

module.exports = {
  getCQCProviderData: async function (locationID) {
    const { data } = await axios.get(
      'https://api.cqc.org.uk/public/v1/providers/' + locationID + '?partnerCode=SkillsForCare',
    );

    return data;
  },
};
