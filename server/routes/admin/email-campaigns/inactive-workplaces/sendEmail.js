const sendInBlueEmail = require('../../../../utils/email/sendInBlueEmail');

const sendEmail = async (workplace) => {
  sendInBlueEmail.sendEmail(
    {
      email: workplace.user.email,
      name: workplace.user.name,
    },
    workplace.emailTemplateId,
    {
      name: workplace.name,
      workplaceId: workplace.nmdsId,
      lastUpdated: workplace.lastUpdated,
      nameOfUser: workplace.user.name,
    },
  );
};

module.exports = {
  sendEmail
};
