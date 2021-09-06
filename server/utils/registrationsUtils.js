const config = require('../config/config');
const moment = require('moment-timezone');

module.exports.convertWorkplaceToCorrectFormat = (rawWorkplace) => {
  const workplace = rawWorkplace.toJSON();

  return {
    created: moment.utc(workplace.created).tz(config.get('timezone')).format('D/M/YYYY h:mma'),
    username: workplace.updatedBy,
    establishment: {
      id: workplace.EstablishmentID,
      name: workplace.NameValue,
      isRegulated: workplace.IsRegulated,
      nmdsId: workplace.NmdsID,
      address: workplace.Address1,
      address2: workplace.Address2,
      address3: workplace.Address3,
      postcode: workplace.PostCode,
      town: workplace.Town,
      county: workplace.County,
      locationId: workplace.LocationID,
      provid: workplace.ProvID,
      mainService: workplace.mainService.name,
      parentId: workplace.ParentID,
      status: workplace.Status,
      uid: workplace.EstablishmentUID,
    },
  };
};

module.exports.convertLoginToCorrectFormat = (rawLogin) => {
  const login = rawLogin.toJSON();

  return {
    name: login.FullNameValue,
    username: login.login.username,
    securityQuestion: login.SecurityQuestionValue,
    securityQuestionAnswer: login.SecurityQuestionAnswerValue,
    email: login.EmailValue,
    phone: login.PhoneValue,
    created: moment.utc(login.created).tz(config.get('timezone')).format('D/M/YYYY h:mma'),
  };
};
