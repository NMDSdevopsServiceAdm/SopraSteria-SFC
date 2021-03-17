const sendInBlueEmail = require('../../../utils/email/sendInBlueEmail');

const sendEmail = async (workplace) => {
  const params = {
    WORKPLACE_ID: workplace.nmdsId,
      FULL_NAME: workplace.user.name,
  };

  if (workplace.subsidiaries) {
    params.SUBSIDIARIES = workplace.subsidiaries;
  };

  sendInBlueEmail.sendEmail(
    {
      email: workplace.user.email,
      name: workplace.user.name,
    },
    workplace.emailTemplate.id,
    params,
  )
};

module.exports = {
  sendEmail,
};
