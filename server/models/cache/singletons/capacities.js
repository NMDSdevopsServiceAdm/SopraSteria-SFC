const dbmodels = require('../../../models');

let ALL_CAPACITIES = [];

class CapacitiesCache {
  constructor() {}

  static async initialize() {
    const capacities = await dbmodels.serviceCapacity.findAll({
      attributes: ['id', 'seq', 'question'],
      order: [['seq', 'ASC']],
      include: [
        {
          model: dbmodels.services,
          as: 'service',
          attributes: ['id', 'category', 'name'],
          order: [
            ['category', 'ASC'],
            ['name', 'ASC'],
          ],
        },
      ],
    });

    ALL_CAPACITIES = capacities;
  }

  static allMyCapacities(allAssociatedServiceIndices) {
    if (allAssociatedServiceIndices && Array.isArray(allAssociatedServiceIndices)) {
      // DO NOT RETURN REFERENCES TO THE ORIGINAL CACHE VALUES - BECAUSE CAPACITY PROPERTIES MODIFIES THE OBJECTS
      return ALL_CAPACITIES.filter(
        (x) =>
          allAssociatedServiceIndices &&
          allAssociatedServiceIndices.length > 0 &&
          allAssociatedServiceIndices.indexOf(x.service.id) > -1,
      ).map((thisCap) => {
        return {
          id: thisCap.id,
          seq: thisCap.seq,
          question: thisCap.question,
          service: {
            id: thisCap.service.id,
            category: thisCap.service.category,
            name: thisCap.service.name,
          },
        };
      });
    } else {
      // no given set of services - return empty set of capacities
      return [];
    }
  }
}

if (dbmodels.status.ready) {
  CapacitiesCache.initialize()
    .then()
    .catch((err) => {
      console.error('Failed to initialise CapacitiesCache: ', err);
    });
} else {
  dbmodels.status.on(dbmodels.status.READY_EVENT, () => {
    // initialising BUDI
    CapacitiesCache.initialize()
      .then()
      .catch((err) => {
        console.error('Failed to initialise CapacitiesCache: ', err);
      });
  });
}

exports.CapacitiesCache = CapacitiesCache;
