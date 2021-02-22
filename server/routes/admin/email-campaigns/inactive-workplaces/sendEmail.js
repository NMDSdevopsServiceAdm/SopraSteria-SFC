const { sendEmail } = require('../../../../utils/email/sendInBlueEmail');

const sendGroupEmail = async (inactiveWorkplaces, templateId) => {
  inactiveWorkplaces.map((workplace) => {
    sendEmail(
      {
        email: workplace.user.email,
        name: workplace.user.name,
      },
      templateId,
      {
        name: workplace.name,
        workplaceId: workplace.nmdsId,
        lastUpdated: workplace.lastUpdated,
        nameOfUser: workplace.user.name,
      },
    );
  });
};

module.exports = sendGroupEmail;
