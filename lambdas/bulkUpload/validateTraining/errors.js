const moment = require('moment');

exports._getValidateLocaleStIdErrMessage = (localeStId, MAX_LENGTH) => {
  if (!localeStId) {
    return 'LOCALESTID has not been supplied';
  } else if (localeStId.length > MAX_LENGTH) {
    return `LOCALESTID is longer than ${MAX_LENGTH} characters`;
  }
};

exports._getValidateUniqueWorkerIdErrMessage = (uniqueId, MAX_LENGTH) => {
  if (!uniqueId) {
    return 'UNIQUEWORKERID has not been supplied';
  } else if (uniqueId.length > MAX_LENGTH) {
    return `UNIQUEWORKERID is longer than ${MAX_LENGTH} characters`;
  }
};

exports._getValidateDateCompletedErrMessage = (dateCompleted) => {
  if (!dateCompleted.isValid()) {
    return 'DATECOMPLETED is incorrectly formatted';
  } else if (dateCompleted.isAfter(moment())) {
    return 'DATECOMPLETED is in the future';
  }
};

exports._getValidateExpiryErrDetails = (expiredDate, dateCompleted) => {
  if (!expiredDate.isValid()) {
    return { errMessage: 'EXPIRYDATE is incorrectly formatted', errColumnName: 'EXPIRYDATE' };
  } else if (expiredDate.isSameOrBefore(dateCompleted, 'day')) {
    return { errMessage: 'EXPIRYDATE must be after DATECOMPLETED', errColumnName: 'EXPIRYDATE/DATECOMPLETED' };
  }
};

exports._getValidateDescriptionErrMessage = (description, MAX_LENGTH) => {
  if (description.length > MAX_LENGTH) {
    return `DESCRIPTION is longer than ${MAX_LENGTH} characters`;
  }
};
