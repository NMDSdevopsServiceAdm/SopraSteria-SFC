const CQCDataApi = require('./CQCDataAPI');
const models = require('../models');

const getProviderId = async (locationId) => {
  if (!locationId) {
    return null;
  }

  try {
    const locationFound = await models.location.findByLocationID(locationId);
    if (locationFound?.providerid) {
      return locationFound.providerid;
    }

    const cqcData = await CQCDataApi.getWorkplaceCQCData(locationId);
    return cqcData?.providerId ?? null;
  } catch (error) {
    console.error('Error when looking up the provider ID: ', error);
    return null;
  }
};

module.exports = {
  getProviderId,
};
