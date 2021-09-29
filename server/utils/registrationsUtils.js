const config = require('../config/config');
const moment = require('moment-timezone');
const get = require('lodash/get');

module.exports.convertWorkplaceAndUserDetails = (workplace) => {
  const convertedWorkplace = {
    created: moment.utc(workplace.created).tz(config.get('timezone')).format('D/M/YYYY h:mma'),
    username: workplace.updatedBy,
    establishment: {
      id: workplace.get('EstablishmentID'),
      name: workplace.NameValue,
      isRegulated: workplace.get('IsRegulated'),
      nmdsId: workplace.get('NmdsID'),
      address: workplace.get('Address1'),
      address2: workplace.get('Address2'),
      address3: workplace.get('Address3'),
      postcode: workplace.get('PostCode'),
      town: workplace.get('Town'),
      county: workplace.get('County'),
      locationId: workplace.get('LocationID'),
      provid: workplace.get('ProvID'),
      mainService: workplace.mainService.name,
      parentId: workplace.get('ParentID'),
      parentUid: workplace.get('ParentUID'),
      parentEstablishmentId: null,
      status: workplace.get('Status'),
      uid: workplace.get('EstablishmentUID'),
      reviewer: workplace.get('Reviewer'),
      inReview: workplace.get('InReview'),
    },
  };

  if (workplace.users && workplace.users.length > 0) {
    return {
      ...convertedWorkplace,
      ...convertUserDetails(workplace.users[0]),
    };
  }
  return convertedWorkplace;
};

const convertUserDetails = (user) => {
  return {
    name: user.get('FullNameValue'),
    username: get(user, 'login.username'),
    securityQuestion: user.get('SecurityQuestionValue'),
    securityQuestionAnswer: user.get('SecurityQuestionAnswerValue'),
    email: user.get('EmailValue'),
    phone: user.get('PhoneValue'),
    created: moment.utc(user.created).tz(config.get('timezone')).format('D/M/YYYY h:mma'),
  };
};

module.exports.convertBasicRegistrationResponse = (registration) => {
  return {
    created: registration.created,
    updated: registration.updated,
    name: registration.NameValue,
    postcode: registration.get('PostCode'),
    status: registration.get('Status'),
    workplaceUid: registration.get('EstablishmentUID'),
    parentUid: registration.get('ParentUID'),
    parentId: registration.get('ParentID'),
    parentEstablishmentId: registration.parentEstablishmentId,
  };
};
