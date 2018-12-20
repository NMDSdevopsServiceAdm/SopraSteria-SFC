exports.shareDataJSON = (establishment) => {
  let jsonObject = {
    enabled: establishment.shareData
  };

  if (establishment.shareData) {
    jsonObject.with = [];

    if (establishment.shareWithCQC) jsonObject.with.push('CQC');
    if (establishment.shareWithLA) jsonObject.with.push('Local Authority');
  }

  return  jsonObject;
};