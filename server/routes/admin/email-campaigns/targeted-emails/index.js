const express = require('express');
const sendInBlue = require('../../../../utils/email/sendInBlueEmail');
const models = require('../../../../models/');
const router = express.Router();

const templateOptions = {
  templateStatus: true, // Boolean | Filter on the status of the template. Active = true, inactive = false
  limit: 50, // Number | Number of documents returned per page
  offset: 0, // Number | Index of the first document in the page
  sort: 'desc', // String | Sort the results in the ascending/descending order of record creation. Default order is **descending** if `sort` is not passed
};

const getTargetedTotalEmails = async (req, res) => {
  const groups = {
    'primaryUsers': await models.user.allPrimaryUsers(),
  };

  try {
    const users = groups[req.query.groupType];
    return res.status(200).send({ totalEmails: users.length });
  } catch(error) {
    console.error(error);
    return res.status(503).send();
  }
};

const getTargetedEmailTemplates = async (req, res) => {
  try {
    const templates = await sendInBlue.getTemplates(templateOptions);
    const formattedTemplates = templates.templates.map(({ id, name }) => {
      return { id, name };
    });

    return res.status(200).send({
      templates: formattedTemplates,
    });
  } catch (error) {
    return res.status(200).send({
      templates: [],
    });
  }
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
module.exports.templateOptions = templateOptions;
