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

  static allMyOtherServices(services, establishment) {
    const cqc = establishment.isRegulated;

    return ALL_SERVICES
      .filter(x => services.indexOf(x) < 0)
      .filter(x => cqc ? x.iscqcregistered !== cqc : x.iscqcregistered === cqc )
      .map( x => { return { id: x.id, name: x.name, category: x.category }});
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
