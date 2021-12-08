const config = require('../config/config');
const moment = require('moment');
const get = require('lodash/get');

module.exports.convertIndividualCqcStatusChange = (cqcStatusChange) => {
  return {
    status: cqcStatusChange.Status,
    requestUid: cqcStatusChange.UUID,
    username: cqcStatusChange.User.FullNameValue,
    establishment: {
      establishmentUid: cqcStatusChange.Establishment.uid,
      workplaceId: cqcStatusChange.Establishment.nmdsId,
      name: cqcStatusChange.Establishment.NameValue,
      address1: cqcStatusChange.Establishment.Address1,
      address2: cqcStatusChange.Establishment.Address2,
      address3: cqcStatusChange.Establishment.Address3,
      town: cqcStatusChange.Establishment.Town,
      county: cqcStatusChange.Establishment.County,
      postcode: cqcStatusChange.Establishment.PostCode,
    },
    data: {
      currentService: {
        id: cqcStatusChange.Data.currentService.id,
        name: cqcStatusChange.Data.currentService.name,
        other: cqcStatusChange.Data.currentService.other,
      },
      requestedService: {
        id: cqcStatusChange.Data.requestedService.id,
        name: cqcStatusChange.Data.requestedService.name,
        other: cqcStatusChange.Data.requestedService.other,
      },
    },
  };
};

// const convertNotes = notes => {
//   return notes.map(note => {
//     return {
//       note:
//     }
//   })
// }
