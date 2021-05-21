const dbmodels = require('../../../models');
const { ready } = require('./ready');

let ALL_SERVICES = [];

class ServiceCache {
  constructor() {}

  static async initialize() {
    const services = await dbmodels.services.findAll({
      attributes: ['id', 'name', 'category', 'iscqcregistered', 'isMain', 'other'],
      group: ['id', 'name'],
      order: [
        ['category', 'ASC'],
        ['name', 'ASC'],
      ],
      raw: true,
    });

    ALL_SERVICES = services;
  }

  static allMyOtherServices(services) {
    return ALL_SERVICES.filter((x) => services && services.length > 0 && services.indexOf(x.id) < 0).map((x) => {
      return { id: x.id, name: x.name, category: x.category };
    });
  }

  static allMyServices(isCqcRegulated = false) {
    // if not undefined
    if (isCqcRegulated === true || isCqcRegulated === false) {
      // for CQC regulated establishments, they can use all services, regardless of whether it's a CQC service of not
      //  hwoever, for non-CQC regulated establishments, they can only use those services that are not CQC regulated
      return ALL_SERVICES.filter((x) => (isCqcRegulated ? true : x.iscqcregistered === false)).map((x) => {
        return { id: x.id, name: x.name, category: x.category, other: x.other };
      });
    }

    return [];
  }
}

ready(dbmodels, ServiceCache, 'ServiceCache');

exports.ServiceCache = ServiceCache;
