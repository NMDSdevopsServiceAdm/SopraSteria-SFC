const CQCDataApi = require('./CQCDataAPI');

const getProviderId = async (locationId) => {
  if (!locationId) {
    return null;
  }

  try {
    const data = await CQCDataApi.getWorkplaceCQCData(locationId);
    return data?.providerId ?? null;
  } catch (error) {
    console.error('CQC API Error: ', error);
    return null;
  }
};

module.exports = {
  getProviderId,
};
