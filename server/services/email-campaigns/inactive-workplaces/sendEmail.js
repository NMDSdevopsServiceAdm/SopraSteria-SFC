const sendInBlueEmail = require('../../../utils/email/sendInBlueEmail');

const sendEmail = async (workplace) => {
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
};
