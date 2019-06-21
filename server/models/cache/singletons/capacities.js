const dbmodels = require('../../../models');

let ALL_CAPACITIES = [];

class CapacitiesCache {
  constructor() {}

  static async initialize() {
    const services = await dbmodels.establishmentCapacity.findAll({
      // attributes: ['id', 'answer'],
      include: [{
        model: dbmodels.serviceCapacity,
        as: 'reference',
        attributes: ['id', 'question']
      }]
    });

    ALL_CAPACITIES = services.map(service => service.dataValues);
  }

  static getCapacities() {
    return (ALL_CAPACITIES || [])
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
