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

router.route('/total').get(getTargetedTotalEmails);
router.route('/templates').get(getTargetedEmailTemplates);

module.exports = router;
module.exports.getTargetedTotalEmails = getTargetedTotalEmails;
module.exports.getTargetedEmailTemplates = getTargetedEmailTemplates;
