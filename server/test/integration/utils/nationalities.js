const Random = require('./random');

exports.lookupRandomNationality = (nationalities) => {
  const randomNationalityIndex = Random.randomInt(0, nationalities.length - 1);
  return nationalities[randomNationalityIndex];
};
