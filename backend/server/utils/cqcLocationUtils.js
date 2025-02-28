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
    const providerIdFound = cqcData?.providerId;
    if (!providerIdFound) {
      return null;
    }

    await models.location.updateProviderID(locationId, providerIdFound);

    return providerIdFound;
  } catch (error) {
    console.error('Error when looking up the provider ID: ', error);
    return null;
  }
};

module.exports = {
  getProviderId,
};
