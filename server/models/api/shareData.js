const LaFormatters = require('./la');

exports.shareDataJSON = (establishment, authorities) => {
  let jsonObject = {
    enabled: establishment.shareData
  };

  if (establishment.shareData) {
    jsonObject.with = [];

    if (establishment.shareWithCQC) jsonObject.with.push('CQC');
    if (establishment.shareWithLA) jsonObject.with.push('Local Authority');
  }

  if (establishment.shareWithLA) {
    jsonObject.authorities = [];

    if (authorities && Array.isArray(authorities)) {
      jsonObject.authorities = LaFormatters.listOfLAsJSON(authorities)
    }
  }

  return  jsonObject;
};