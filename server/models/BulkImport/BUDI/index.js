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
  static services(direction, originalCode) {
    if (direction == BUDI.TO_ASC) {
      return originalCode + 1;
    } else {
      return originalCode - 1;
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
