const Random = require('./random');

exports.lookupRandomService = (services) => {
  const randomCategoryIndex = Random.randomInt(0, services.length - 1);
  const randomServiceIndex = Random.randomInt(0, services[randomCategoryIndex].services.length - 1);
  return services[randomCategoryIndex].services[randomServiceIndex];
};
