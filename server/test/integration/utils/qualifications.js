const Random = require('./random');

exports.lookupRandomQualification = (qualifications) => {
  const randomQualificationIndex = Random.randomInt(0, qualifications.length - 1);
  return qualifications[randomQualificationIndex];
};
