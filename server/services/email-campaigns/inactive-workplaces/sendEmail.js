const config = require('../../../config/config');
const sendInBlueEmail = require('../../../utils/email/sendInBlueEmail');

const isWhitelisted = (email) => {
  if (!config.get('sendInBlue.whitelist')) {
    return true;
  }

  return config.get('sendInBlue.whitelist').split(',').includes(email);
};

const sendEmail = async (workplace) => {
  if (!isWhitelisted(workplace.user.email)) {
    return;
  }

  sendInBlueEmail.sendEmail(
    {
      email: workplace.user.email,
      name: workplace.user.name,
    },
    workplace.emailTemplate.id,
    {
      WORKPLACE_ID: workplace.nmdsId,
      FULL_NAME: workplace.user.name,
    },
  );
};

module.exports = {
  sendEmail,
  isWhitelisted,
};
