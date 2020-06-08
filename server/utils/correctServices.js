const {ServiceCache} = require('../models/cache/singletons/services');

exports.correctServices = async (establishment, cqc, otherServices = null) => {
  const allServices = [];
  if (otherServices !== null && Array.isArray(otherServices)) {
    otherServices.map(other => allServices.push(other.id));
  } else if (establishment && establishment.otherServices && Array.isArray(establishment.otherServices)) {
    establishment.otherServices.map(other => allServices.push(other.id));
  }
  console.log(allServices);
  const correctServices = ServiceCache.allMyServices(cqc);
  console.log(correctServices);
  console.log(otherServices);
  const services = [];
  correctServices.map(correctService => {
    allServices.map(currentService => {
      if (correctService.id === currentService) {
        services.push(correctService);
      }
    })
  });
  console.log(services);
  return services;
};
