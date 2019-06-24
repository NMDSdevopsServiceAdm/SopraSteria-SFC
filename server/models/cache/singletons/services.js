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
      ],
      raw: true
    });

    ALL_SERVICES = services;
  }

  static allMyOtherServices(services) {
    return ALL_SERVICES
      .filter(x => services && services.length > 0 && services.indexOf(x) < 0)
      .map( x => { return { id: x.id, name: x.name, category: x.category }});
  }

  static allMyServices(establishment) {
    const cqc = establishment ? establishment.isRegulated : false;

    return ALL_SERVICES
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
