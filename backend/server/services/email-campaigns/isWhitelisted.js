const config = require('../../config/config');

const isWhitelisted = (email) => {
  if (!config.get('sendInBlue.whitelist')) {
    return true;
  }

  return config.get('sendInBlue.whitelist').split(',').includes(email);
};

module.exports = {
  isWhitelisted,
};
