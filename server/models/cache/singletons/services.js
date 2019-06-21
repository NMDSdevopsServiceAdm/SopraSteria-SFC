const dbmodels = require('../../../models');

let ALL_SERVICES = [];

class ServiceCache {
  constructor() {}

  static async initialize() {
    const services = await dbmodels.services.findAll({
      attributes: ['id', 'name', 'category', 'iscqcregistered'],
      group: ['id', 'name' ],
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });

    ALL_SERVICES = services.map(service => service.dataValues);
  }

  static getServices() {
    return (ALL_SERVICES || [])
  }
}

if (dbmodels.status.ready) {
  ServiceCache.initialize()
    .then()
    .catch(err => {
      console.error("Failed to initialise ServiceCache: ", err);
    });
} else {
  dbmodels.status.on(dbmodels.status.READY_EVENT, () => {
    // initialising BUDI
    ServiceCache.initialize()
      .then()
      .catch(err => {
        console.error("Failed to initialise ServiceCache: ", err);
      });
  });
}

exports.ServiceCache = ServiceCache;
