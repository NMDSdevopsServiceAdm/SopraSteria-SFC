const Random = require('./random');

exports.lookupRandomRecruitedFrom = (origins) => {
  const randomOriginIndex = Random.randomInt(0, origins.length - 1);
  return origins[randomOriginIndex];
};
