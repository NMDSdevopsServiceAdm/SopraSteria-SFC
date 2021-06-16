const express = require('express');
const router = express.Router();

const getTargetedTotalEmails = async (req, res) => {
  return res.status(200).send({ totalEmails: 1500 });
};

const getTargetedEmailTemplates = async (req, res) => {
  return res.status(200).send({
    templates: [
      {
        id: 3,
        name: 'Email about something important',
      },
    ],
  });
};

const createTargetedEmailsCampaign = async (req, res) => {
  return res.status(200).send({ success: true });
};

router.route('/total').get(getTargetedTotalEmails);
router.route('/templates').get(getTargetedEmailTemplates);
router.route('/').post(createTargetedEmailsCampaign);

module.exports = router;
module.exports.getTargetedTotalEmails = getTargetedTotalEmails;
module.exports.getTargetedEmailTemplates = getTargetedEmailTemplates;
module.exports.createTargetedEmailsCampaign = createTargetedEmailsCampaign;
