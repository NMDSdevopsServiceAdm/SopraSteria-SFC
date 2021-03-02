const sendInBlueEmail = require('../../../../utils/email/sendInBlueEmail');

const sendEmail = async (workplace) => {
  sendInBlueEmail.sendEmail(
    {
      email: workplace.user.email,
      name: workplace.user.name,
    },
    workplace.emailTemplateId,
    {
      WORKPLACE_ID: workplace.nmdsId,
    },
  );
};

module.exports = {
  sendEmail
};
