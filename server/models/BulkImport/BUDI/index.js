// BUDI maps bulk imports and exports

// uses Database Reference data - initialised within the singleton on startup
const dbmodels = require('../../../models');

let ALL_CSSRS = null;
let ALL_CAPACITIES = null;
let ALL_UTILISATIONS = null;

class BUDI {
  static async initialize () {
    const cssrFetch = await dbmodels.cssr.findAll({
      attributes: ['id', 'name'],
      group: ['id', 'name'],
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

    const capacitiesFetch = await dbmodels.serviceCapacity.findAll({
      order: [
        ['id', 'ASC']
      ]
    });

    if (Array.isArray(capacitiesFetch)) {
      ALL_CAPACITIES = capacitiesFetch
        .filter(thisCapacity => thisCapacity.type === 'Capacity')
        .map(thisCapacity => {
          return {
            serviceCapacityId: thisCapacity.id,
            serviceId: thisCapacity.serviceId
          };
        });

      ALL_UTILISATIONS = capacitiesFetch
        .filter(thisCapacity => thisCapacity.type === 'Utilisation')
        .map(thisCapacity => {
          return {
            serviceCapacityId: thisCapacity.id,
            serviceId: thisCapacity.serviceId
          };
        });
    }
  }

  static get TO_ASC () { return 100; }
  static get FROM_ASC () { return 200; }

  // maps services (main/other)
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static services (direction, originalCode) {
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
      { ASC: 14, BUDI: 75 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisService => thisService.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisService => thisService.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps service users
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static serviceUsers (direction, originalCode) {
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
      { ASC: 23, BUDI: 21 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisService => thisService.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisService => thisService.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps job roles
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static jobRoles (direction, originalCode) {
    const fixedMapping = [
      { ASC: 26, BUDI: 1 },
      { ASC: 15, BUDI: 2 },
      { ASC: 13, BUDI: 3 },
      { ASC: 22, BUDI: 4 },
      { ASC: 28, BUDI: 5 },
      { ASC: 27, BUDI: 6 },
      { ASC: 25, BUDI: 7 },
      { ASC: 10, BUDI: 8 },
      { ASC: 11, BUDI: 9 },
      { ASC: 12, BUDI: 10 },
      { ASC: 3, BUDI: 11 },
      { ASC: 18, BUDI: 15 },
      { ASC: 23, BUDI: 16 },
      { ASC: 4, BUDI: 17 },
      { ASC: 29, BUDI: 22 },
      { ASC: 20, BUDI: 23 },
      { ASC: 14, BUDI: 24 },
      { ASC: 2, BUDI: 25 },
      { ASC: 5, BUDI: 26 },
      { ASC: 21, BUDI: 27 },
      { ASC: 1, BUDI: 34 },
      { ASC: 24, BUDI: 35 },
      { ASC: 19, BUDI: 36 },
      { ASC: 17, BUDI: 37 },
      { ASC: 16, BUDI: 38 },
      { ASC: 7, BUDI: 39 },
      { ASC: 8, BUDI: 40 },
      { ASC: 9, BUDI: 41 },
      { ASC: 6, BUDI: 42 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisJob => thisJob.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisJob => thisJob.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps contract type (permanent, temp, volunteer)
  static contractType (direction, originalCode) {
    const fixedMapping = [
      { ASC: 'Permanent', BUDI: 1 },
      { ASC: 'Temporary', BUDI: 2 },
      { ASC: 'Pool/Bank', BUDI: 3 },
      { ASC: 'Agency', BUDI: 4 },
      { ASC: 'Other', BUDI: 7 } // multiple values mapping to Other; 7 needs to be first in list for the export
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisType => thisType.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisType => thisType.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps establishment employer type (private, local authority, volunteer, et al)
  static establishmentType (direction, originalCode) {
    const fixedMapping = [
      { ASC: 'Local Authority (adult services)', BUDI: 1 },
      { ASC: 'Local Authority (generic/other)', BUDI: 3 },
      { ASC: 'Private Sector', BUDI: 6 },
      { ASC: 'Voluntary / Charity', BUDI: 7 },
      { ASC: 'Other', BUDI: 8 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisTrainingCategory => thisTrainingCategory.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisType => thisType.ASC === originalCode);
    return found ? found.BUDI : 8;
  }

  // maps Local Authority (CSSR)
  static localAuthority (direction, originalCode) {
    if (direction === BUDI.TO_ASC) {
      // lookup against all known CSSRs using the given original code as index
      return ALL_CSSRS.find(thisCssr => thisCssr.custodianCode === originalCode);
    }

    // ASC WDS local authority is an object where "custodianCode" is the Local Authority integer
    return originalCode.custodianCode;
  }

  // maps reasons for leaving - one to one mapping (no ASC WDS reasons for leaving)
  static reasonsForLeaving (direction, originalCode) {
    const fixedMapping = [
      { ASC: 1, BUDI: 21 },
      { ASC: 2, BUDI: 22 },
      { ASC: 3, BUDI: 23 },
      { ASC: 4, BUDI: 24 },
      { ASC: 5, BUDI: 25 },
      { ASC: 6, BUDI: 26 },
      { ASC: 7, BUDI: 27 },
      { ASC: 8, BUDI: 28 },
      { ASC: 9, BUDI: 29 }
    ];

    // TODO - the above mappings are incorrect; awaiting for Maria's/Jackie's return
    // if (direction === BUDI.TO_ASC) {
    //   const found = fixedMapping.find(thisReason => thisReason.BUDI === originalCode);
    //   return found ? found.ASC : null;
    // } else {
    //   const found = fixedMapping.find(thisReason => thisReason.ASC === originalCode)
    //   return found ? found.BUDI : null;
    // }
    return originalCode;
  }

  // destination on  leaving - one to one mapping (no ASC WDS destinations on leaving)
  static destinationOnLeaving (direction, originalCode) {
    return originalCode;
  }

  // maps training roles
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static trainingCategory (direction, originalCode) {
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
      { ASC: 34, BUDI: 40 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisTrainingCategory => thisTrainingCategory.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisTrainingCategory => thisTrainingCategory.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps ethnicity
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static ethnicity (direction, originalCode) {
    const fixedMapping = [
      { ASC: 1, BUDI: 31 },
      { ASC: 3, BUDI: 32 },
      { ASC: 4, BUDI: 33 },
      { ASC: 5, BUDI: 34 },
      { ASC: 6, BUDI: 35 },
      { ASC: 7, BUDI: 36 },
      { ASC: 8, BUDI: 37 },
      { ASC: 9, BUDI: 38 },
      { ASC: 10, BUDI: 39 },
      { ASC: 11, BUDI: 40 },
      { ASC: 12, BUDI: 41 },
      { ASC: 13, BUDI: 42 },
      { ASC: 14, BUDI: 43 },
      { ASC: 15, BUDI: 44 },
      { ASC: 16, BUDI: 45 },
      { ASC: 17, BUDI: 46 },
      { ASC: 18, BUDI: 47 },
      { ASC: 19, BUDI: 98 },
      { ASC: 2, BUDI: 99 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisEthnicity => thisEthnicity.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisEthnicity => thisEthnicity.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps nationality
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static nationality (direction, originalCode) {
    const fixedMapping = [
      { ASC: 1, BUDI: 4 },
      { ASC: 2, BUDI: 8 },
      { ASC: 3, BUDI: 12 },
      { ASC: 4, BUDI: 16 },
      { ASC: 5, BUDI: 20 },
      { ASC: 6, BUDI: 24 },
      { ASC: 8, BUDI: 28 },
      { ASC: 13, BUDI: 31 },
      { ASC: 9, BUDI: 32 },
      { ASC: 11, BUDI: 36 },
      { ASC: 12, BUDI: 40 },
      { ASC: 14, BUDI: 44 },
      { ASC: 15, BUDI: 48 },
      { ASC: 16, BUDI: 50 },
      { ASC: 10, BUDI: 51 },
      { ASC: 17, BUDI: 52 },
      { ASC: 19, BUDI: 56 },
      { ASC: 22, BUDI: 60 },
      { ASC: 23, BUDI: 64 },
      { ASC: 24, BUDI: 68 },
      { ASC: 25, BUDI: 70 },
      { ASC: 26, BUDI: 72 },
      { ASC: 152, BUDI: 578 },
      { ASC: 27, BUDI: 76 },
      { ASC: 20, BUDI: 84 },
      { ASC: 183, BUDI: 90 },
      { ASC: 30, BUDI: 96 },
      { ASC: 31, BUDI: 100 },
      { ASC: 33, BUDI: 104 },
      { ASC: 34, BUDI: 108 },
      { ASC: 18, BUDI: 112 },
      { ASC: 35, BUDI: 116 },
      { ASC: 36, BUDI: 120 },
      { ASC: 37, BUDI: 124 },
      { ASC: 38, BUDI: 132 },
      { ASC: 39, BUDI: 136 },
      { ASC: 40, BUDI: 140 },
      { ASC: 189, BUDI: 144 },
      { ASC: 41, BUDI: 148 },
      { ASC: 42, BUDI: 152 },
      { ASC: 43, BUDI: 156 },
      { ASC: 199, BUDI: 158 },
      { ASC: 11, BUDI: 36 },
      { ASC: 11, BUDI: 36 },
      { ASC: 44, BUDI: 170 },
      { ASC: 45, BUDI: 174 },
      { ASC: 74, BUDI: 250 },
      { ASC: 46, BUDI: 178 },
      { ASC: 47, BUDI: 180 },
      { ASC: 48, BUDI: 184 },
      { ASC: 49, BUDI: 188 },
      { ASC: 50, BUDI: 191 },
      { ASC: 51, BUDI: 192 },
      { ASC: 54, BUDI: 196 },
      { ASC: 55, BUDI: 203 },
      { ASC: 21, BUDI: 204 },
      { ASC: 56, BUDI: 208 },
      { ASC: 58, BUDI: 212 },
      { ASC: 59, BUDI: 214 },
      { ASC: 62, BUDI: 218 },
      { ASC: 170, BUDI: 222 },
      { ASC: 66, BUDI: 226 },
      { ASC: 69, BUDI: 231 },
      { ASC: 67, BUDI: 232 },
      { ASC: 68, BUDI: 233 },
      { ASC: 70, BUDI: 234 },
      { ASC: 71, BUDI: 242 },
      { ASC: 73, BUDI: 246 },
      { ASC: 73, BUDI: 246 },
      { ASC: 74, BUDI: 250 },
      { ASC: 74, BUDI: 250 },
      { ASC: 74, BUDI: 250 },
      { ASC: 74, BUDI: 250 },
      { ASC: 57, BUDI: 262 },
      { ASC: 75, BUDI: 266 },
      { ASC: 77, BUDI: 268 },
      { ASC: 76, BUDI: 270 },
      { ASC: 156, BUDI: 275 },
      { ASC: 78, BUDI: 276 },
      { ASC: 79, BUDI: 288 },
      { ASC: 80, BUDI: 292 },
      { ASC: 108, BUDI: 296 },
      { ASC: 81, BUDI: 300 },
      { ASC: 82, BUDI: 304 },
      { ASC: 83, BUDI: 308 },
      { ASC: 74, BUDI: 250 },
      { ASC: 84, BUDI: 316 },
      { ASC: 85, BUDI: 320 },
      { ASC: 87, BUDI: 324 },
      { ASC: 88, BUDI: 328 },
      { ASC: 89, BUDI: 332 },
      { ASC: 11, BUDI: 36 },
      { ASC: 100, BUDI: 380 },
      { ASC: 90, BUDI: 340 },
      { ASC: 91, BUDI: 344 },
      { ASC: 92, BUDI: 348 },
      { ASC: 93, BUDI: 352 },
      { ASC: 94, BUDI: 356 },
      { ASC: 95, BUDI: 360 },
      { ASC: 96, BUDI: 364 },
      { ASC: 97, BUDI: 368 },
      { ASC: 98, BUDI: 372 },
      { ASC: 99, BUDI: 376 },
      { ASC: 100, BUDI: 380 },
      { ASC: 101, BUDI: 384 },
      { ASC: 102, BUDI: 388 },
      { ASC: 103, BUDI: 392 },
      { ASC: 105, BUDI: 398 },
      { ASC: 104, BUDI: 400 },
      { ASC: 106, BUDI: 404 },
      { ASC: 150, BUDI: 408 },
      { ASC: 186, BUDI: 410 },
      { ASC: 110, BUDI: 414 },
      { ASC: 111, BUDI: 417 },
      { ASC: 114, BUDI: 422 },
      { ASC: 140, BUDI: 426 },
      { ASC: 113, BUDI: 428 },
      { ASC: 115, BUDI: 430 },
      { ASC: 116, BUDI: 434 },
      { ASC: 117, BUDI: 438 },
      { ASC: 118, BUDI: 440 },
      { ASC: 119, BUDI: 442 },
      { ASC: 120, BUDI: 446 },
      { ASC: 122, BUDI: 450 },
      { ASC: 123, BUDI: 454 },
      { ASC: 124, BUDI: 458 },
      { ASC: 125, BUDI: 462 },
      { ASC: 126, BUDI: 466 },
      { ASC: 127, BUDI: 470 },
      { ASC: 129, BUDI: 474 },
      { ASC: 130, BUDI: 478 },
      { ASC: 131, BUDI: 480 },
      { ASC: 132, BUDI: 484 },
      { ASC: 135, BUDI: 492 },
      { ASC: 136, BUDI: 496 },
      { ASC: 134, BUDI: 498 },
      { ASC: 137, BUDI: 499 },
      { ASC: 138, BUDI: 500 },
      { ASC: 139, BUDI: 504 },
      { ASC: 141, BUDI: 508 },
      { ASC: 153, BUDI: 512 },
      { ASC: 142, BUDI: 516 },
      { ASC: 143, BUDI: 520 },
      { ASC: 144, BUDI: 524 },
      { ASC: 60, BUDI: 528 },
      { ASC: 60, BUDI: 528 },
      { ASC: 60, BUDI: 528 },
      { ASC: 74, BUDI: 250 },
      { ASC: 217, BUDI: 548 },
      { ASC: 145, BUDI: 554 },
      { ASC: 146, BUDI: 558 },
      { ASC: 148, BUDI: 562 },
      { ASC: 147, BUDI: 566 },
      { ASC: 149, BUDI: 570 },
      { ASC: 11, BUDI: 36 },
      { ASC: 152, BUDI: 578 },
      { ASC: 4, BUDI: 840 },
      { ASC: 4, BUDI: 840 },
      { ASC: 133, BUDI: 583 },
      { ASC: 128, BUDI: 584 },
      { ASC: 155, BUDI: 585 },
      { ASC: 154, BUDI: 586 },
      { ASC: 157, BUDI: 591 },
      { ASC: 158, BUDI: 598 },
      { ASC: 159, BUDI: 600 },
      { ASC: 160, BUDI: 604 },
      { ASC: 72, BUDI: 608 },
      { ASC: 162, BUDI: 616 },
      { ASC: 163, BUDI: 620 },
      { ASC: 86, BUDI: 624 },
      { ASC: 61, BUDI: 626 },
      { ASC: 165, BUDI: 630 },
      { ASC: 166, BUDI: 634 },
      { ASC: 74, BUDI: 250 },
      { ASC: 167, BUDI: 642 },
      { ASC: 168, BUDI: 643 },
      { ASC: 169, BUDI: 646 },
      { ASC: 74, BUDI: 250 },
      { ASC: 190, BUDI: 654 },
      { ASC: 107, BUDI: 659 },
      { ASC: 7, BUDI: 660 },
      { ASC: 191, BUDI: 662 },
      { ASC: 74, BUDI: 250 },
      { ASC: 74, BUDI: 250 },
      { ASC: 220, BUDI: 670 },
      { ASC: 171, BUDI: 674 },
      { ASC: 173, BUDI: 678 },
      { ASC: 174, BUDI: 682 },
      { ASC: 176, BUDI: 686 },
      { ASC: 177, BUDI: 688 },
      { ASC: 178, BUDI: 690 },
      { ASC: 179, BUDI: 694 },
      { ASC: 180, BUDI: 702 },
      { ASC: 181, BUDI: 703 },
      { ASC: 219, BUDI: 704 },
      { ASC: 182, BUDI: 705 },
      { ASC: 184, BUDI: 706 },
      { ASC: 185, BUDI: 710 },
      { ASC: 225, BUDI: 716 },
      { ASC: 188, BUDI: 724 },
      { ASC: 187, BUDI: 728 },
      { ASC: 139, BUDI: 732 },
      { ASC: 193, BUDI: 736 },
      { ASC: 194, BUDI: 740 },
      { ASC: 152, BUDI: 578 },
      { ASC: 195, BUDI: 748 },
      { ASC: 196, BUDI: 752 },
      { ASC: 197, BUDI: 756 },
      { ASC: 198, BUDI: 760 },
      { ASC: 200, BUDI: 762 },
      { ASC: 202, BUDI: 764 },
      { ASC: 203, BUDI: 768 },
      { ASC: 204, BUDI: 776 },
      { ASC: 205, BUDI: 780 },
      { ASC: 64, BUDI: 784 },
      { ASC: 207, BUDI: 788 },
      { ASC: 208, BUDI: 792 },
      { ASC: 209, BUDI: 795 },
      { ASC: 210, BUDI: 796 },
      { ASC: 211, BUDI: 798 },
      { ASC: 212, BUDI: 800 },
      { ASC: 213, BUDI: 804 },
      { ASC: 121, BUDI: 807 },
      { ASC: 63, BUDI: 818 },
      { ASC: 201, BUDI: 834 },
      { ASC: 4, BUDI: 840 },
      { ASC: 32, BUDI: 854 },
      { ASC: 214, BUDI: 858 },
      { ASC: 215, BUDI: 860 },
      { ASC: 218, BUDI: 862 },
      { ASC: 221, BUDI: 876 },
      { ASC: 172, BUDI: 882 },
      { ASC: 223, BUDI: 887 },
      { ASC: 224, BUDI: 894 },
      { ASC: 112, BUDI: 418 },
      { ASC: 60, BUDI: 534 },
      { ASC: 60, BUDI: 535 },
      { ASC: 109, BUDI: 995 },
      { ASC: 60, BUDI: 531 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisNationality => thisNationality.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisNationality => thisNationality.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps country of birth
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static country (direction, originalCode) {
    const fixedMapping = [
      { ASC: 1, BUDI: 4 },
      { ASC: 3, BUDI: 8 },
      { ASC: 9, BUDI: 10 },
      { ASC: 4, BUDI: 12 },
      { ASC: 5, BUDI: 16 },
      { ASC: 6, BUDI: 20 },
      { ASC: 7, BUDI: 24 },
      { ASC: 10, BUDI: 28 },
      { ASC: 16, BUDI: 31 },
      { ASC: 11, BUDI: 32 },
      { ASC: 14, BUDI: 36 },
      { ASC: 15, BUDI: 40 },
      { ASC: 17, BUDI: 44 },
      { ASC: 18, BUDI: 48 },
      { ASC: 19, BUDI: 50 },
      { ASC: 12, BUDI: 51 },
      { ASC: 20, BUDI: 52 },
      { ASC: 22, BUDI: 56 },
      { ASC: 25, BUDI: 60 },
      { ASC: 26, BUDI: 64 },
      { ASC: 27, BUDI: 68 },
      { ASC: 28, BUDI: 70 },
      { ASC: 29, BUDI: 72 },
      { ASC: 30, BUDI: 74 },
      { ASC: 31, BUDI: 76 },
      { ASC: 23, BUDI: 84 },
      { ASC: 32, BUDI: 86 },
      { ASC: 212, BUDI: 90 },
      { ASC: 251, BUDI: 92 },
      { ASC: 33, BUDI: 96 },
      { ASC: 34, BUDI: 100 },
      { ASC: 161, BUDI: 104 },
      { ASC: 36, BUDI: 108 },
      { ASC: 21, BUDI: 112 },
      { ASC: 37, BUDI: 116 },
      { ASC: 38, BUDI: 120 },
      { ASC: 39, BUDI: 124 },
      { ASC: 40, BUDI: 132 },
      { ASC: 41, BUDI: 136 },
      { ASC: 42, BUDI: 140 },
      { ASC: 218, BUDI: 144 },
      { ASC: 43, BUDI: 148 },
      { ASC: 44, BUDI: 152 },
      { ASC: 45, BUDI: 156 },
      { ASC: 226, BUDI: 158 },
      { ASC: 46, BUDI: 162 },
      { ASC: 47, BUDI: 166 },
      { ASC: 48, BUDI: 170 },
      { ASC: 49, BUDI: 174 },
      { ASC: 151, BUDI: 175 },
      { ASC: 50, BUDI: 178 },
      { ASC: 51, BUDI: 180 },
      { ASC: 52, BUDI: 184 },
      { ASC: 53, BUDI: 188 },
      { ASC: 55, BUDI: 191 },
      { ASC: 56, BUDI: 192 },
      { ASC: 57, BUDI: 196 },
      { ASC: 58, BUDI: 203 },
      { ASC: 24, BUDI: 204 },
      { ASC: 59, BUDI: 208 },
      { ASC: 61, BUDI: 212 },
      { ASC: 62, BUDI: 214 },
      { ASC: 63, BUDI: 218 },
      { ASC: 65, BUDI: 222 },
      { ASC: 66, BUDI: 226 },
      { ASC: 69, BUDI: 231 },
      { ASC: 67, BUDI: 232 },
      { ASC: 68, BUDI: 233 },
      { ASC: 71, BUDI: 234 },
      { ASC: 70, BUDI: 238 },
      { ASC: 215, BUDI: 239 },
      { ASC: 72, BUDI: 242 },
      { ASC: 73, BUDI: 246 },
      { ASC: 2, BUDI: 248 },
      { ASC: 74, BUDI: 250 },
      { ASC: 75, BUDI: 254 },
      { ASC: 76, BUDI: 258 },
      { ASC: 77, BUDI: 260 },
      { ASC: 60, BUDI: 262 },
      { ASC: 78, BUDI: 266 },
      { ASC: 80, BUDI: 268 },
      { ASC: 79, BUDI: 270 },
      { ASC: 179, BUDI: 275 },
      { ASC: 81, BUDI: 276 },
      { ASC: 82, BUDI: 288 },
      { ASC: 83, BUDI: 292 },
      { ASC: 126, BUDI: 296 },
      { ASC: 84, BUDI: 300 },
      { ASC: 85, BUDI: 304 },
      { ASC: 86, BUDI: 308 },
      { ASC: 87, BUDI: 312 },
      { ASC: 88, BUDI: 316 },
      { ASC: 89, BUDI: 320 },
      { ASC: 91, BUDI: 324 },
      { ASC: 93, BUDI: 328 },
      { ASC: 94, BUDI: 332 },
      { ASC: 107, BUDI: 334 },
      { ASC: 108, BUDI: 336 },
      { ASC: 109, BUDI: 340 },
      { ASC: 110, BUDI: 344 },
      { ASC: 111, BUDI: 348 },
      { ASC: 112, BUDI: 352 },
      { ASC: 113, BUDI: 356 },
      { ASC: 114, BUDI: 360 },
      { ASC: 115, BUDI: 364 },
      { ASC: 116, BUDI: 368 },
      { ASC: 117, BUDI: 372 },
      { ASC: 118, BUDI: 376 },
      { ASC: 119, BUDI: 380 },
      { ASC: 54, BUDI: 384 },
      { ASC: 120, BUDI: 388 },
      { ASC: 121, BUDI: 392 },
      { ASC: 124, BUDI: 398 },
      { ASC: 123, BUDI: 400 },
      { ASC: 125, BUDI: 404 },
      { ASC: 127, BUDI: 408 },
      { ASC: 128, BUDI: 410 },
      { ASC: 129, BUDI: 414 },
      { ASC: 130, BUDI: 417 },
      { ASC: 132, BUDI: 422 },
      { ASC: 133, BUDI: 426 },
      { ASC: 131, BUDI: 428 },
      { ASC: 134, BUDI: 430 },
      { ASC: 135, BUDI: 434 },
      { ASC: 136, BUDI: 438 },
      { ASC: 137, BUDI: 440 },
      { ASC: 138, BUDI: 442 },
      { ASC: 139, BUDI: 446 },
      { ASC: 141, BUDI: 450 },
      { ASC: 142, BUDI: 454 },
      { ASC: 143, BUDI: 458 },
      { ASC: 144, BUDI: 462 },
      { ASC: 145, BUDI: 466 },
      { ASC: 146, BUDI: 470 },
      { ASC: 148, BUDI: 474 },
      { ASC: 149, BUDI: 478 },
      { ASC: 150, BUDI: 480 },
      { ASC: 152, BUDI: 484 },
      { ASC: 155, BUDI: 492 },
      { ASC: 156, BUDI: 496 },
      { ASC: 154, BUDI: 498 },
      { ASC: 157, BUDI: 499 },
      { ASC: 158, BUDI: 500 },
      { ASC: 159, BUDI: 504 },
      { ASC: 160, BUDI: 508 },
      { ASC: 176, BUDI: 512 },
      { ASC: 162, BUDI: 516 },
      { ASC: 163, BUDI: 520 },
      { ASC: 164, BUDI: 524 },
      { ASC: 165, BUDI: 528 },
      { ASC: 166, BUDI: 530 },
      { ASC: 13, BUDI: 533 },
      { ASC: 167, BUDI: 540 },
      { ASC: 248, BUDI: 548 },
      { ASC: 168, BUDI: 554 },
      { ASC: 169, BUDI: 558 },
      { ASC: 170, BUDI: 562 },
      { ASC: 171, BUDI: 566 },
      { ASC: 172, BUDI: 570 },
      { ASC: 173, BUDI: 574 },
      { ASC: 175, BUDI: 578 },
      { ASC: 174, BUDI: 580 },
      { ASC: 245, BUDI: 581 },
      { ASC: 153, BUDI: 583 },
      { ASC: 147, BUDI: 584 },
      { ASC: 178, BUDI: 585 },
      { ASC: 177, BUDI: 586 },
      { ASC: 180, BUDI: 591 },
      { ASC: 181, BUDI: 598 },
      { ASC: 182, BUDI: 600 },
      { ASC: 183, BUDI: 604 },
      { ASC: 184, BUDI: 608 },
      { ASC: 185, BUDI: 612 },
      { ASC: 186, BUDI: 616 },
      { ASC: 187, BUDI: 620 },
      { ASC: 92, BUDI: 624 },
      { ASC: 230, BUDI: 626 },
      { ASC: 188, BUDI: 630 },
      { ASC: 189, BUDI: 634 },
      { ASC: 190, BUDI: 638 },
      { ASC: 191, BUDI: 642 },
      { ASC: 192, BUDI: 643 },
      { ASC: 193, BUDI: 646 },
      { ASC: 194, BUDI: 652 },
      { ASC: 195, BUDI: 654 },
      { ASC: 196, BUDI: 659 },
      { ASC: 8, BUDI: 660 },
      { ASC: 197, BUDI: 662 },
      { ASC: 198, BUDI: 663 },
      { ASC: 199, BUDI: 666 },
      { ASC: 200, BUDI: 670 },
      { ASC: 202, BUDI: 674 },
      { ASC: 203, BUDI: 678 },
      { ASC: 204, BUDI: 682 },
      { ASC: 205, BUDI: 686 },
      { ASC: 206, BUDI: 688 },
      { ASC: 207, BUDI: 690 },
      { ASC: 208, BUDI: 694 },
      { ASC: 209, BUDI: 702 },
      { ASC: 210, BUDI: 703 },
      { ASC: 250, BUDI: 704 },
      { ASC: 211, BUDI: 705 },
      { ASC: 213, BUDI: 706 },
      { ASC: 214, BUDI: 710 },
      { ASC: 257, BUDI: 716 },
      { ASC: 217, BUDI: 724 },
      { ASC: 216, BUDI: 728 },
      { ASC: 254, BUDI: 732 },
      { ASC: 219, BUDI: 736 },
      { ASC: 220, BUDI: 740 },
      { ASC: 221, BUDI: 744 },
      { ASC: 222, BUDI: 748 },
      { ASC: 223, BUDI: 752 },
      { ASC: 224, BUDI: 756 },
      { ASC: 225, BUDI: 760 },
      { ASC: 227, BUDI: 762 },
      { ASC: 229, BUDI: 764 },
      { ASC: 231, BUDI: 768 },
      { ASC: 232, BUDI: 772 },
      { ASC: 233, BUDI: 776 },
      { ASC: 234, BUDI: 780 },
      { ASC: 242, BUDI: 784 },
      { ASC: 235, BUDI: 788 },
      { ASC: 236, BUDI: 792 },
      { ASC: 237, BUDI: 795 },
      { ASC: 238, BUDI: 796 },
      { ASC: 239, BUDI: 798 },
      { ASC: 240, BUDI: 800 },
      { ASC: 241, BUDI: 804 },
      { ASC: 140, BUDI: 807 },
      { ASC: 64, BUDI: 818 },
      { ASC: 90, BUDI: 831 },
      { ASC: 122, BUDI: 832 },
      { ASC: 228, BUDI: 834 },
      { ASC: 244, BUDI: 840 },
      { ASC: 252, BUDI: 850 },
      { ASC: 35, BUDI: 854 },
      { ASC: 246, BUDI: 858 },
      { ASC: 247, BUDI: 860 },
      { ASC: 249, BUDI: 862 },
      { ASC: 253, BUDI: 876 },
      { ASC: 201, BUDI: 882 },
      { ASC: 255, BUDI: 887 },
      { ASC: 256, BUDI: 894 },
      { ASC: 261, BUDI: 418 },
      { ASC: 262, BUDI: 535 },
      { ASC: 263, BUDI: 995 },
      { ASC: 264, BUDI: 534 },
      { ASC: 265, BUDI: 531 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisCountry => thisCountry.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisCountry => thisCountry.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps recruitment source
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static recruitment (direction, originalCode) {
    const fixedMapping = [
      { BUDI: 1, ASC: 1 },
      { BUDI: 2, ASC: 2 },
      { BUDI: 5, ASC: 3 },
      { BUDI: 7, ASC: 5 },
      { BUDI: 8, ASC: 6 },
      { BUDI: 10, ASC: 7 },
      { BUDI: 12, ASC: 8 },
      { BUDI: 15, ASC: 10 },
      { BUDI: 17, ASC: 4 },
      { BUDI: 18, ASC: 9 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisSource => thisSource.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisSource => thisSource.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps nursing specialist
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static nursingSpecialist (direction, originalCode) {
    const fixedMapping = [
      { BUDI: 1, ASC: 1 },
      { BUDI: 2, ASC: 2 },
      { BUDI: 3, ASC: 3 },
      { BUDI: 4, ASC: 4 },
      { BUDI: 5, ASC: 5 },
      { BUDI: 6, ASC: 6 },
      { BUDI: 7, ASC: 7 },
      { BUDI: 8, ASC: 8 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisSpecialist => thisSpecialist.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisSpecialist => thisSpecialist.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  static mapNurseSpecialismsToDb(specialisms) {
    if (specialisms.length === 1 && specialisms[0] === 7) {
      return { value: `Don't know` }
    } else if (specialisms.length === 1 && specialisms[0] === 8) {
      return { value: 'No' }
    } else {
      return {
        value: 'Yes',
        specialisms: specialisms.filter(s => s !== 7 && s !== 8).map(s => ({ id: s }))
      }
    }
  }

  // maps (highest) qualification levels
  // TODO - we have mapping table - but no agreed solution (in DB or in CMS???)
  static qualificationLevels (direction, originalCode) {
    const fixedMapping = [
      { BUDI: 0, ASC: 1 },
      { BUDI: 1, ASC: 2 },
      { BUDI: 2, ASC: 3 },
      { BUDI: 3, ASC: 4 },
      { BUDI: 4, ASC: 5 },
      { BUDI: 5, ASC: 6 },
      { BUDI: 6, ASC: 7 },
      { BUDI: 7, ASC: 8 },
      { BUDI: 8, ASC: 9 },
      { BUDI: 999, ASC: 10 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisSpecialist => thisSpecialist.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisSpecialist => thisSpecialist.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  // maps qualification types
  static qualifications (direction, originalCode) {
    const fixedMapping = [
      { BUDI: 1, ASC: 97 },
      { BUDI: 2, ASC: 98 },
      { BUDI: 3, ASC: 96 },
      { BUDI: 4, ASC: 93 },
      { BUDI: 5, ASC: 94 },
      { BUDI: 6, ASC: 95 },
      { BUDI: 8, ASC: 24 },
      { BUDI: 9, ASC: 99 },
      { BUDI: 10, ASC: 100 },
      { BUDI: 12, ASC: 25 },
      { BUDI: 13, ASC: 102 },
      { BUDI: 14, ASC: 107 },
      { BUDI: 15, ASC: 106 },
      { BUDI: 16, ASC: 72 },
      { BUDI: 17, ASC: 89 },
      { BUDI: 18, ASC: 71 },
      { BUDI: 19, ASC: 16 },
      { BUDI: 20, ASC: 1 },
      { BUDI: 22, ASC: 14 },
      { BUDI: 25, ASC: 15 },
      { BUDI: 26, ASC: 26 },
      { BUDI: 27, ASC: 114 },
      { BUDI: 28, ASC: 116 },
      { BUDI: 32, ASC: 115 },
      { BUDI: 33, ASC: 113 },
      { BUDI: 34, ASC: 111 },
      { BUDI: 35, ASC: 109 },
      { BUDI: 36, ASC: 110 },
      { BUDI: 37, ASC: 117 },
      { BUDI: 38, ASC: 118 },
      { BUDI: 39, ASC: 119 },
      { BUDI: 41, ASC: 20 },
      { BUDI: 42, ASC: 30 },
      { BUDI: 48, ASC: 4 },
      { BUDI: 49, ASC: 5 },
      { BUDI: 50, ASC: 60 },
      { BUDI: 51, ASC: 61 },
      { BUDI: 52, ASC: 10 },
      { BUDI: 53, ASC: 80 },
      { BUDI: 54, ASC: 81 },
      { BUDI: 55, ASC: 82 },
      { BUDI: 56, ASC: 83 },
      { BUDI: 57, ASC: 84 },
      { BUDI: 58, ASC: 85 },
      { BUDI: 62, ASC: 86 },
      { BUDI: 63, ASC: 87 },
      { BUDI: 64, ASC: 88 },
      { BUDI: 67, ASC: 66 },
      { BUDI: 68, ASC: 67 },
      { BUDI: 72, ASC: 23 },
      { BUDI: 73, ASC: 32 },
      { BUDI: 74, ASC: 19 },
      { BUDI: 76, ASC: 64 },
      { BUDI: 77, ASC: 65 },
      { BUDI: 82, ASC: 103 },
      { BUDI: 83, ASC: 104 },
      { BUDI: 84, ASC: 105 },
      { BUDI: 85, ASC: 17 },
      { BUDI: 86, ASC: 2 },
      { BUDI: 87, ASC: 45 },
      { BUDI: 88, ASC: 9 },
      { BUDI: 89, ASC: 69 },
      { BUDI: 90, ASC: 12 },
      { BUDI: 91, ASC: 18 },
      { BUDI: 92, ASC: 13 },
      { BUDI: 93, ASC: 62 },
      { BUDI: 94, ASC: 21 },
      { BUDI: 95, ASC: 22 },
      { BUDI: 96, ASC: 11 },
      { BUDI: 98, ASC: 59 },
      { BUDI: 99, ASC: 6 },
      { BUDI: 100, ASC: 7 },
      { BUDI: 101, ASC: 68 },
      { BUDI: 102, ASC: 63 },
      { BUDI: 103, ASC: 8 },
      { BUDI: 104, ASC: 75 },
      { BUDI: 105, ASC: 76 },
      { BUDI: 107, ASC: 3 },
      { BUDI: 108, ASC: 47 },
      { BUDI: 109, ASC: 74 },
      { BUDI: 110, ASC: 31 },
      { BUDI: 111, ASC: 27 },
      { BUDI: 112, ASC: 28 },
      { BUDI: 113, ASC: 134 },
      { BUDI: 114, ASC: 135 },
      { BUDI: 115, ASC: 90 },
      { BUDI: 116, ASC: 91 },
      { BUDI: 119, ASC: 33 },
      { BUDI: 121, ASC: 34 },
      { BUDI: 136, ASC: 35 },
      { BUDI: 123, ASC: 36 },
      { BUDI: 124, ASC: 37 },
      { BUDI: 125, ASC: 38 },
      { BUDI: 118, ASC: 39 },
      { BUDI: 137, ASC: 40 },
      { BUDI: 131, ASC: 41 },
      { BUDI: 134, ASC: 42 },
      { BUDI: 138, ASC: 43 },
      { BUDI: 143, ASC: 44 },
      { BUDI: 141, ASC: 48 },
      { BUDI: 120, ASC: 49 },
      { BUDI: 122, ASC: 50 },
      { BUDI: 126, ASC: 51 },
      { BUDI: 128, ASC: 52 },
      { BUDI: 127, ASC: 53 },
      { BUDI: 142, ASC: 54 },
      { BUDI: 133, ASC: 55 },
      { BUDI: 135, ASC: 56 },
      { BUDI: 139, ASC: 57 },
      { BUDI: 140, ASC: 58 },
      { BUDI: 129, ASC: 77 },
      { BUDI: 130, ASC: 78 },
      { BUDI: 132, ASC: 79 },
      { BUDI: 117, ASC: 112 },
      { BUDI: 302, ASC: 121 },
      { BUDI: 304, ASC: 122 },
      { BUDI: 303, ASC: 123 },
      { BUDI: 310, ASC: 124 },
      { BUDI: 308, ASC: 125 },
      { BUDI: 306, ASC: 126 },
      { BUDI: 301, ASC: 127 },
      { BUDI: 305, ASC: 128 },
      { BUDI: 307, ASC: 129 },
      { BUDI: 309, ASC: 130 },
      { BUDI: 312, ASC: 131 },
      { BUDI: 313, ASC: 132 },
      { BUDI: 311, ASC: 133 }
    ];

    if (direction === BUDI.TO_ASC) {
      const found = fixedMapping.find(thisQualification => thisQualification.BUDI === originalCode);
      return found ? found.ASC : null;
    }

    const found = fixedMapping.find(thisQualification => thisQualification.ASC === originalCode);
    return found ? found.BUDI : null;
  }

  static capacity (direction, originalCode) {
    if (Array.isArray(ALL_CAPACITIES)) {
      // capacities are assumed to be the first question for a given service id (originalCode)
      const foundCapacity = ALL_CAPACITIES.find(thisCapacity => thisCapacity.serviceId === originalCode);

      // foundCapacity will be undefined if not found
      if (typeof foundCapacity !== 'undefined') {
        return foundCapacity.serviceCapacityId;
      }
    }

    return null;
  }

  static utilisation (direction, originalCode) {
    if (Array.isArray(ALL_UTILISATIONS)) {
      const foundUtilisation = ALL_UTILISATIONS.find(thisCapacity => thisCapacity.serviceId === originalCode);

      // foundUtilisation will be undefined if not found
      if (typeof foundUtilisation !== 'undefined') {
        return foundUtilisation.serviceCapacityId;
      }
    }

    return null;
  }

  static serviceFromCapacityId (serviceCapacityId) {
    if (Array.isArray(ALL_CAPACITIES)) {
      const foundCapacity = ALL_CAPACITIES.find(thisCapacity => thisCapacity.serviceCapacityId === serviceCapacityId);

      // foundCapacity will be undefined if not found
      if (typeof foundCapacity !== 'undefined') {
        return foundCapacity.serviceId;
      }
    }

    return null;
  }

  static serviceFromUtilisationId (serviceCapacityId) {
    if (Array.isArray(ALL_UTILISATIONS)) {
      const foundCapacity = ALL_UTILISATIONS.find(thisCapacity => thisCapacity.serviceCapacityId === serviceCapacityId);

      // foundCapacity will be undefined if not found
      if (typeof foundCapacity !== 'undefined') {
        return foundCapacity.serviceId;
      }
    }

    return null;
  }
}

// and now to initialise BUDI
if (dbmodels.status.ready) {
  BUDI.initialize()
    .then()
    .catch(err => {
      console.error('Failed to initialise BUDI: ', err);
    });
} else {
  dbmodels.status.on(dbmodels.status.READY_EVENT, () => {
    // initialising BUDI
    BUDI.initialize()
      .then()
      .catch(err => {
        console.error('Failed to initialise BUDI: ', err);
      });
  });
}

exports.BUDI = BUDI;
