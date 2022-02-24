const omit = require('lodash').omit;

const removeSensitiveData = (userData) => {
  return omit(userData, ['password', 'securityQuestion', 'securityQuestionAnswer']);
};

module.exports = {
  removeSensitiveData,
};
