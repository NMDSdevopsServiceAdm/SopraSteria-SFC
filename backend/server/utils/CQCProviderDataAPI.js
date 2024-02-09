const axios = require('axios');

module.exports = {
  getCQCProviderData: async function (locationId) {
    const regex = new RegExp('^[0-9 -]{1,}$', 'gm');
    let isCorrectFormat = regex.test(locationId);

    if (isCorrectFormat) {
      const { data } = await axios.get(
        'https://api.cqc.org.uk/public/v1/providers/' + locationId + '?partnerCode=SkillsForCare',
      );
      return data;
    }
    return {};
  },
};
