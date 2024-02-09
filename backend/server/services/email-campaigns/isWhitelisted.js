const config = require('../../config/config');

const isWhitelisted = (email) => {
  if (!config.get('sendInBlue.whitelist')) {
    return true;
  }

  // If whitelist environment varible contains off then disable whitelist
  if (config.get('sendInBlue.whitelist') === "off") {
    return true;
  }

  return config.get('sendInBlue.whitelist').split(',').includes(email);
};

module.exports = {
  isWhitelisted,
};
