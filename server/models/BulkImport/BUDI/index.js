// BUDI maps bulk imports and exports

// uses Database Reference data - initialised within the singleton on startup
const dbmodels = require('../../../models');
const { ready } = require('../../cache/singletons/ready');
const { mappings } = require('../../../../reference/BUDIMappings');

let ALL_CSSRS = null;
let ALL_CAPACITIES = null;
let ALL_UTILISATIONS = null;

class BUDI {
  static async initialize() {
    const cssrFetch = await dbmodels.cssr.findAll({
      attributes: ['id', 'name'],
      group: ['id', 'name'],
      order: [['id', 'ASC']],
    });

    if (Array.isArray(cssrFetch)) {
      ALL_CSSRS = cssrFetch.map((thisCssr) => {
        return {
          custodianCode: thisCssr.id,
          name: thisCssr.name,
        };
      });
    }

    const capacitiesFetch = await dbmodels.serviceCapacity.findAll({
      order: [['id', 'ASC']],
    });

    if (Array.isArray(capacitiesFetch)) {
      ALL_CAPACITIES = capacitiesFetch
        .filter((thisCapacity) => thisCapacity.type === 'Capacity')
        .map((thisCapacity) => {
          return {
            serviceCapacityId: thisCapacity.id,
            serviceId: thisCapacity.serviceId,
          };
        });

      ALL_UTILISATIONS = capacitiesFetch
        .filter((thisCapacity) => thisCapacity.type === 'Utilisation')
        .map((thisCapacity) => {
          return {
            serviceCapacityId: thisCapacity.id,
            serviceId: thisCapacity.serviceId,
          };
        });
    }
  }

  static get TO_ASC() {
    return 'BUDI';
  }
  static get FROM_ASC() {
    return 'ASC';
  }

  static mapFrom(originalType) {
    return originalType === 'ASC' ? 'BUDI' : 'ASC';
  }

  // maps services (main/other)
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static services(direction, originalCode) {
    const fixedMapping = [
      { ASC: 24, BUDI: 1 },
      { ASC: 25, BUDI: 2 },
      { ASC: 13, BUDI: 53 },
      { ASC: 12, BUDI: 5 },
      { ASC: 9, BUDI: 6 },
      { ASC: 10, BUDI: 7 },
      { ASC: 20, BUDI: 8 },
      { ASC: 35, BUDI: 73 },
      { ASC: 11, BUDI: 10 },
      { ASC: 21, BUDI: 54 },
      { ASC: 23, BUDI: 55 },
      { ASC: 18, BUDI: 12 },
      { ASC: 22, BUDI: 74 },
      { ASC: 1, BUDI: 13 },
      { ASC: 7, BUDI: 14 },
      { ASC: 2, BUDI: 15 },
      { ASC: 8, BUDI: 16 },
      { ASC: 19, BUDI: 17 },
      { ASC: 3, BUDI: 18 },
      { ASC: 5, BUDI: 19 },
      { ASC: 4, BUDI: 20 },
      { ASC: 6, BUDI: 21 },
      { ASC: 27, BUDI: 61 },
      { ASC: 28, BUDI: 62 },
      { ASC: 26, BUDI: 63 },
      { ASC: 29, BUDI: 64 },
      { ASC: 30, BUDI: 66 },
      { ASC: 32, BUDI: 67 },
      { ASC: 31, BUDI: 68 },
      { ASC: 33, BUDI: 69 },
      { ASC: 34, BUDI: 70 },
      { ASC: 17, BUDI: 71 },
      { ASC: 15, BUDI: 52 },
      { ASC: 16, BUDI: 72 },
      { ASC: 36, BUDI: 60 },
      { ASC: 14, BUDI: 75 },
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find((thisService) => thisService.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find((thisService) => thisService.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps service users
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static serviceUsers(direction, originalCode) {
    const fixedMapping = [
      { ASC: 1, BUDI: 1 },
      { ASC: 2, BUDI: 2 },
      { ASC: 3, BUDI: 22 },
      { ASC: 4, BUDI: 23 },
      { ASC: 5, BUDI: 25 },
      { ASC: 6, BUDI: 26 },
      { ASC: 8, BUDI: 46 },
      { ASC: 7, BUDI: 27 },
      { ASC: 9, BUDI: 3 },
      { ASC: 10, BUDI: 28 },
      { ASC: 11, BUDI: 6 },
      { ASC: 12, BUDI: 29 },
      { ASC: 13, BUDI: 5 },
      { ASC: 14, BUDI: 4 },
      { ASC: 15, BUDI: 7 },
      { ASC: 16, BUDI: 8 },
      { ASC: 17, BUDI: 31 },
      { ASC: 18, BUDI: 9 },
      { ASC: 19, BUDI: 45 },
      { ASC: 20, BUDI: 18 },
      { ASC: 21, BUDI: 19 },
      { ASC: 22, BUDI: 20 },
      { ASC: 23, BUDI: 21 },
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find((thisService) => thisService.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find((thisService) => thisService.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  static convertValue(originalType, originalCode, fixedMapping) {
    const found = fixedMapping.find((thisJob) => thisJob[originalType] === originalCode);
    return found ? found[this.mapFrom(originalType)] : null;
  }

  static jobRoles(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.JOB_ROLES);
  }

  static contractType(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.CONTRACT_TYPE);
  }

  // maps establishment employer type (private, local authority, volunteer, et al)
  static establishmentType(direction, originalCode) {
    const fixedMapping = [
      { ASC: 'Local Authority (adult services)', BUDI: 1 },
      { ASC: 'Local Authority (generic/other)', BUDI: 3 },
      { ASC: 'Private Sector', BUDI: 6 },
      { ASC: 'Voluntary / Charity', BUDI: 7 },
      { ASC: 'Other', BUDI: 8 },
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find((thisTrainingCategory) => thisTrainingCategory.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find((thisType) => thisType.ASC === originalCode);
    return found ? found.BUDI : 8;
  }

  // maps Local Authority (CSSR)
  static localAuthority(direction, originalCode) {
    if (direction === BUDI.TO_ASC) {
      // lookup against all known CSSRs using the given original code as index
      return ALL_CSSRS.find((thisCssr) => thisCssr.custodianCode === originalCode);
    }

    // ASC WDS local authority is an object where "custodianCode" is the Local Authority integer
    return originalCode.custodianCode;
  }

  // maps reasons for leaving - one to one mapping (no ASC WDS reasons for leaving)
  static reasonsForLeaving(direction, originalCode) {
    return originalCode;
  }

  // destination on  leaving - one to one mapping (no ASC WDS destinations on leaving)
  static destinationOnLeaving(direction, originalCode) {
    return originalCode;
  }

  // maps training roles
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static trainingCategory(direction, originalCode) {
    const fixedMapping = [
      { ASC: 8, BUDI: 1 },
      { ASC: 10, BUDI: 2 },
      { ASC: 14, BUDI: 5 },
      { ASC: 17, BUDI: 6 },
      { ASC: 18, BUDI: 7 },
      { ASC: 19, BUDI: 8 },
      { ASC: 20, BUDI: 9 },
      { ASC: 21, BUDI: 10 },
      { ASC: 22, BUDI: 11 },
      { ASC: 23, BUDI: 12 },
      { ASC: 24, BUDI: 13 },
      { ASC: 25, BUDI: 14 },
      { ASC: 27, BUDI: 15 },
      { ASC: 28, BUDI: 16 },
      { ASC: 29, BUDI: 17 },
      { ASC: 31, BUDI: 18 },
      { ASC: 32, BUDI: 19 },
      { ASC: 33, BUDI: 20 },
      { ASC: 12, BUDI: 22 },
      { ASC: 16, BUDI: 23 },
      { ASC: 37, BUDI: 21 },
      { ASC: 3, BUDI: 25 },
      { ASC: 6, BUDI: 26 },
      { ASC: 15, BUDI: 27 },
      { ASC: 4, BUDI: 28 },
      { ASC: 11, BUDI: 29 },
      { ASC: 9, BUDI: 30 },
      { ASC: 26, BUDI: 31 },
      { ASC: 2, BUDI: 32 },
      { ASC: 7, BUDI: 33 },
      { ASC: 13, BUDI: 34 },
      { ASC: 36, BUDI: 35 },
      { ASC: 35, BUDI: 36 },
      { ASC: 5, BUDI: 37 },
      { ASC: 30, BUDI: 38 },
      { ASC: 1, BUDI: 39 },
      { ASC: 34, BUDI: 40 },
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find((thisTrainingCategory) => thisTrainingCategory.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find((thisTrainingCategory) => thisTrainingCategory.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  static ethnicity(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.ETHNICITY);
  }

  static nationality(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.NATIONALITY);
  }

  static country(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.COUNTRY);
  }

  static recruitment(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.RECRUITMENT);
  }

  static nursingSpecialist(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.NURSING_SPECIALIST);
  }

  static mapNurseSpecialismsToDb(specialisms) {
    if (specialisms.length === 1 && specialisms[0] === 7) {
      return { value: 'No' };
    } else if (specialisms.length === 1 && specialisms[0] === 8) {
      return { value: "Don't know" };
    } else {
      return {
        value: 'Yes',
        specialisms: specialisms.filter((s) => s !== 7 && s !== 8).map((s) => ({ id: s })),
      };
    }
  }

  // maps (highest) qualification levels
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static qualificationLevels(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.QUALIFICATION_LEVELS);
  }

  // maps qualification types
  static qualifications(direction, originalCode) {
    return this.convertValue(direction, originalCode, mappings.QUALIFICATIONS);
  }

  static capacity(direction, originalCode) {
    if (Array.isArray(ALL_CAPACITIES)) {
      // capacities are assumed to be the first question for a given service id (originalCode)
      const foundCapacity = ALL_CAPACITIES.find((thisCapacity) => thisCapacity.serviceId === originalCode);

      // foundCapacity will be undefined if not found
      if (typeof foundCapacity !== 'undefined') {
        return foundCapacity.serviceCapacityId;
      }
    }

    return null;
  }

  static utilisation(direction, originalCode) {
    if (Array.isArray(ALL_UTILISATIONS)) {
      const foundUtilisation = ALL_UTILISATIONS.find((thisCapacity) => thisCapacity.serviceId === originalCode);

      // foundUtilisation will be undefined if not found
      if (typeof foundUtilisation !== 'undefined') {
        return foundUtilisation.serviceCapacityId;
      }
    }

    return null;
  }

  static serviceFromCapacityId(serviceCapacityId) {
    if (Array.isArray(ALL_CAPACITIES)) {
      const foundCapacity = ALL_CAPACITIES.find((thisCapacity) => thisCapacity.serviceCapacityId === serviceCapacityId);

      // foundCapacity will be undefined if not found
      if (typeof foundCapacity !== 'undefined') {
        return foundCapacity.serviceId;
      }
    }

    return null;
  }

  static serviceFromUtilisationId(serviceCapacityId) {
    if (Array.isArray(ALL_UTILISATIONS)) {
      const foundCapacity = ALL_UTILISATIONS.find(
        (thisCapacity) => thisCapacity.serviceCapacityId === serviceCapacityId,
      );

      // foundCapacity will be undefined if not found
      if (typeof foundCapacity !== 'undefined') {
        return foundCapacity.serviceId;
      }
    }

    return null;
  }
}

ready(dbmodels, BUDI, 'BUDI');

exports.BUDI = BUDI;
