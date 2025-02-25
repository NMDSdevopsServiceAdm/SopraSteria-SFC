const CQCDataApi = require('./CQCDataAPI');

const getProviderId = async (locationId) => {
  if (!locationId) {
    return null;
  }

  const data = await CQCDataApi.getWorkplaceCQCData(locationId);
  return data?.providerId ?? null;
};

module.exports = {
  getProviderId,
};
