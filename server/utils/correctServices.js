const {ServiceCache} = require('../models/cache/singletons/services');

exports.correctServices = async (establishment, cqc, mainService = null, otherServices = null) => {
  const allServices = [];
  if (otherServices !== null && Array.isArray(otherServices)) {
    otherServices.map(other => allServices.push(other));
  } else if (establishment && establishment.otherServices && Array.isArray(establishment.otherServices)) {
    establishment.otherServices.map(other => allServices.push(other));
  }
  const correctServices = ServiceCache.allMyServices(cqc);
  const services = [];
  correctServices.map(correctService => {
    allServices.map(currentService => {
      if (!(mainService && mainService.id === currentService.id) && correctService.id === currentService.id ) {
        services.push(currentService);
      }
    })
  });
  return services;
};
