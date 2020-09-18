const Random = require('./random');

exports.lookupRandomCountry = (countries) => {
  const randomCountryIndex = Random.randomInt(0, countries.length - 1);
  return countries[randomCountryIndex];
};
