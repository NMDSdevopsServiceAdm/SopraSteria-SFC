const {CapacitiesCache} = require('../models/cache/singletons/capacities');
const models = require('../models/');

exports.correctCapacities = async (establishment, mainService = null, otherServices = null) => {
  const allServices = [];
  if (mainService !== null) {
    allServices.push(mainService.id)
  } else if (establishment && establishment.mainService && establishment.mainService.id) {
    allServices.push(establishment.mainService.id);
  }
  if (otherServices !== null && Array.isArray(otherServices)) {
    otherServices.map(other => allServices.push(other.id));
  } else if (establishment && establishment.otherServices && Array.isArray(establishment.otherServices)) {
    establishment.otherServices.map(other => allServices.push(other.id));
  }
  const correctCapacities = CapacitiesCache.allMyCapacities(allServices);
  const currentCapacities = await models.establishmentCapacity.findAll({
    where: {
      EstablishmentID: establishment.id,
    },
    include: [
      {
        model: models.serviceCapacity,
        as: 'reference',
        attributes: ['id', 'question'],
      },
    ],
    attributes: ['id', 'answer'],
  });
  const capacity = [];
  if (currentCapacities) {
    correctCapacities.map(correctCapacity => {
      currentCapacities.map(currentCapacity => {
        if (correctCapacity.id === currentCapacity.reference.id) {
          capacity.push({
            questionId: correctCapacity.id,
            answer: currentCapacity.answer
          })
        }
      })
    });
  }
  return capacity;
};
