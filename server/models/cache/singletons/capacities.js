const dbmodels = require('../../../models');

let ALL_CAPACITIES = [];

class CapacitiesCache {
  constructor() {}

  static async initialize() {
    const capacities = await dbmodels.serviceCapacity.findAll({
      attributes: ['id', 'seq', 'question'],
      order: [
        ['seq', 'ASC']
      ],
      include: [
        {
            model: dbmodels.services,
            as: 'service',
            attributes: ['id', 'category', 'name'],
            order: [
                ['category', 'ASC'],
                ['name', 'ASC']
            ]
        }
    ]
    });

    ALL_CAPACITIES = capacities;
  }

  static allMyCapacities(allAssociatedServiceIndices) {
    return ALL_CAPACITIES
      .filter(x => allAssociatedServiceIndices && allAssociatedServiceIndices.length > 0 && allAssociatedServiceIndices.indexOf(x.service.id) > -1);
  }
}

if (dbmodels.status.ready) {
  CapacitiesCache.initialize()
    .then()
    .catch(err => {
      console.error("Failed to initialise CapacitiesCache: ", err);
    });
} else {
  dbmodels.status.on(dbmodels.status.READY_EVENT, () => {
    // initialising BUDI
    CapacitiesCache.initialize()
      .then()
      .catch(err => {
        console.error("Failed to initialise CapacitiesCache: ", err);
      });
  });
}

exports.CapacitiesCache = CapacitiesCache;
