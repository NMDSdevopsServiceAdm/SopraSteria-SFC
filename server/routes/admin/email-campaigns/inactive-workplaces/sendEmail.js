const express = require('express');
const { sendEmail } = require('../../../../utils/email/sendInBlueEmail');
const findInactiveWorkplaces = require('./findInactiveWorkplaces');

const sendGroupEmail = async (_, res) => {
  const inactiveWorkplaces = await findInactiveWorkplaces();

  inactiveWorkplaces.map(async (workplace) => {
    console.log(workplace);
    await sendEmail(
      {
        email: workplace.user.email,
        name: workplace.user.name,
      },
      1, // workplace.emailTemplate
      {
        name: workplace.name,
        workplaceId: workplace.nmdsId,
        lastUpdated: workplace.lastUpdated,
        nameOfUser: workplace.user.name,
      },
    );
    // add email to history?
  });
  return res.status(200);
};

const router = express.Router();
router.route('/').post(sendGroupEmail);

module.exports = router;
module.exports.sendGroupEmail = sendGroupEmail;
