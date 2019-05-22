// BUDI maps bulk imports and exports

// uses Database Reference data - initialised within the singleton on startup
const dbmodels = require('../../../models');

let ALL_CSSRS = null;

class BUDI {
  constructor() {
    // initialises with the BUDI
  }

  static async initialize() {
    const cssrFetch = await dbmodels.cssr.findAll({
      attributes: ['id', 'name'],
      group: ['id', 'name' ],
      order: [
        ['id', 'ASC']
      ]
    });

    if (Array.isArray(cssrFetch)) {
      ALL_CSSRS = cssrFetch.map(thisCssr => {
        return {
          custodianCode: thisCssr.id,
          name: thisCssr.name
        };
      });
    }
  }

  static get TO_ASC() { return 100; }
  static get FROM_ASC() { return 200; }

  // maps services (main/other)
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static services(direction, originalCode) {
    const fixedMapping = [
      { "ASC": 24, "BUDI": 1},
      { "ASC": 25, "BUDI": 2},
      { "ASC": 13, "BUDI": 53},
      { "ASC": 12, "BUDI": 5},
      { "ASC": 9, "BUDI": 6},
      { "ASC": 10, "BUDI": 7},
      { "ASC": 20, "BUDI": 8},
      { "ASC": 35, "BUDI": 73},
      { "ASC": 11, "BUDI": 10},
      { "ASC": 21, "BUDI": 54},
      { "ASC": 23, "BUDI": 55},
      { "ASC": 18, "BUDI": 12},
      { "ASC": 22, "BUDI": 74},
      { "ASC": 1, "BUDI": 13},
      { "ASC": 7, "BUDI": 14},
      { "ASC": 2, "BUDI": 15},
      { "ASC": 8, "BUDI": 16},
      { "ASC": 19, "BUDI": 17},
      { "ASC": 3, "BUDI": 18},
      { "ASC": 5, "BUDI": 19},
      { "ASC": 4, "BUDI": 20},
      { "ASC": 6, "BUDI": 21},
      { "ASC": 27, "BUDI": 61},
      { "ASC": 28, "BUDI": 62},
      { "ASC": 26, "BUDI": 63},
      { "ASC": 29, "BUDI": 64},
      { "ASC": 30, "BUDI": 66},
      { "ASC": 32, "BUDI": 67},
      { "ASC": 31, "BUDI": 68},
      { "ASC": 33, "BUDI": 69},
      { "ASC": 34, "BUDI": 70},
      { "ASC": 17, "BUDI": 71},
      { "ASC": 15, "BUDI": 52},
      { "ASC": 16, "BUDI": 72},
      { "ASC": 36, "BUDI": 60},
      { "ASC": 14, "BUDI": 75}
    ];

    if (direction == BUDI.TO_ASC) {
      const found = fixedMapping.find(thisService => thisService.BUDI == originalCode);
      return found ? found.ASC : null;
    } else {
      const found = fixedMapping.find(thisService => thisService.ASC == originalCode)
      return found ? found.BUDI : null;
    }
  }

  // maps contract type (permanent, temp, volunteer)
  static contractType(direction, originalCode) {
    if (direction == BUDI.TO_ASC) {
      return originalCode + 1;
    } else {
      return originalCode - 1;
    }
  }

  // maps establishment employer type (private, local authority, volunteer, et al)
  static establishmentType(direction, originalCode) {
    let mappedEstType = null;

    if (direction == BUDI.TO_ASC) {
      switch (originalCode) {
        case 1:
          mappedEstType = {
            type: 'Local Authority (adult services)',
          };
          break;

        case 2:
          mappedEstType = {
            type: 'Other',
            other: 'Statutory: Local Authority (children services)'
          };
          break;
          
        case 3:
          mappedEstType = {
            type: 'Local Authority (generic/other)',
          };
          break;

        case 4:
          mappedEstType = {
            type: 'Other',
            other: 'Statutory:  Local Authority Owned'
          };
          break;
        
        case 5:
          mappedEstType = {
            type: 'Other',
            other: 'Statutory: Health'
          };
          break;

        case 6:
          mappedEstType = {
            type: 'Private Sector',
          };
          break;

        case 7:
          mappedEstType = {
            type: 'Voluntary / Charity',
          };
          break;

        default:
          mappedEstType =  {
              type: 'Other',
              other: ''
            };
      }
    } else {
      switch (originalCode) {

        default:
          return 8;
      }
    }

    return mappedEstType;
  }

  // maps Local Authority (CSSR)
  static localAuthority(direction, originalCode) {
    if (direction == BUDI.TO_ASC) {
      // lookup against all known CSSRs using the given original code as index
      return ALL_CSSRS.find(thisCssr => thisCssr.custodianCode === originalCode);;
    } else {
      // ASC WDS local authority is an object where "custodianCode" is the Local Authority integer
      return originalCode.custodianCode;
    }
  }
}

BUDI.initialize()
  .then()
  .catch(err => {
    console.error("Failed to initialise BUDI: ", err);
  });

exports.BUDI = BUDI;
