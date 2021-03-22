const {ServiceCache} = require('../models/cache/singletons/services');

exports.correctServices = async (establishment, cqc, mainService = null) => {
  const allServices = [];
  if (establishment && establishment.otherServices && establishment.otherServices.services && Array.isArray(establishment.otherServices.services)) {
    establishment.otherServices.services.map(other => allServices.push(other));
  }

  const services = [];
  const correctServices = ServiceCache.allMyServices(cqc);
  correctServices.map(correctService => {
    allServices.map(currentService => {
      if (!(mainService && mainService.id === currentService.id) && correctService.id === currentService.id ) {
        services.push(currentService);
      }
    });
  });
  const result = {
    value: services.length ? 'Yes' : 'No'
  };
  if (!services.length) return result;

  result.services = services;
  return  result;
};
