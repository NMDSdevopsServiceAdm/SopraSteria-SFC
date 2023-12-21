const { CapacitiesCache } = require('../models/cache/singletons/capacities');
const models = require('../models/');

const getCurrentCapacities = async (establishmentId) => {
  return await models.establishmentCapacity.findAll({
    where: {
      EstablishmentID: establishmentId,
    },
    include: [
      {
        model: models.serviceCapacity,
        as: 'reference',
        attributes: ['id', 'question'],
        include: [
          {
            model: models.services,
            as: 'service',
            attributes: ['name'],
          },
        ]
      },
    ],
    attributes: ['id', 'answer'],
  });
};

exports.correctCapacities = async (establishment, mainService = null, otherServices = null) => {
  const allServices = [];
  if (mainService) {
    allServices.push(mainService.id);
  } else if (establishment && establishment.mainService && establishment.mainService.id) {
    allServices.push(establishment.mainService.id);
  }
  if (otherServices && otherServices.services && Array.isArray(otherServices.services)) {
    otherServices.services.map((other) => allServices.push(other.id));
  } else if (establishment && establishment.otherServices && establishment.otherServices.services && Array.isArray(establishment.otherServices.services)) {
    establishment.otherServices.services.map((other) => allServices.push(other.id));
  }
  const correctCapacities = CapacitiesCache.allMyCapacities(allServices);
  const currentCapacities = await getCurrentCapacities(establishment.id);
  const capacity = [];
  if (currentCapacities) {
    correctCapacities.map((correctCapacity) => {
      currentCapacities.map((currentCapacity) => {
        if (correctCapacity.id === currentCapacity.reference.id) {
          capacity.push({
            questionId: correctCapacity.id,
            answer: currentCapacity.answer,
          });
        }
      });
    });
  }
  return capacity;
};
