const {ServiceCache} = require('../models/cache/singletons/services');

exports.correctServices = async (establishment, cqc, otherServices = null) => {
  const allServices = [];
  if (otherServices !== null && Array.isArray(otherServices)) {
    otherServices.map(other => allServices.push(other.id));
  } else if (establishment && establishment.otherServices && Array.isArray(establishment.otherServices)) {
    establishment.otherServices.map(other => allServices.push(other.id));
  }
  const correctServices = ServiceCache.allMyServices(cqc);
  const services = [];
  correctServices.map(correctService => {
    allServices.map(currentService => {
      if (correctService.id === currentService.reference.id) {
        services.push(correctService)
      }
    })
  });
  return services;
};
