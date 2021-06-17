const express = require('express');
const { celebrate, Joi, errors, Segments } = require('celebrate');
const sendInBlue = require('../../../../utils/email/sendInBlueEmail');
const sendEmail = require('../../../../services/email-campaigns/targeted-emails/sendEmail');
const models = require('../../../../models/');
const router = express.Router();
const { pRateLimit } = require('p-ratelimit');

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
  try {
    const users = await models.user.allPrimaryUsers();
    const templateId = parseInt(req.body.templateId)

    const limit = pRateLimit({
      interval: 1000,
      rate: 5, // 5 emails per second
    });

    users.map((user) => {
      return limit(() => sendEmail.sendEmail(user, templateId));
    });

    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(503).send();
  }
};

router.route('/total').get(
  celebrate({
    [Segments.QUERY]: {
      groupType: Joi.string().valid('primaryUsers'),
    },
  }),
  getTargetedTotalEmails,
);

router.use('/total', errors());
router.route('/templates').get(getTargetedEmailTemplates);

router.use('/', errors());
router.route('/').post(
  celebrate({
    [Segments.BODY]: {
      templateId: Joi.string().required(),
      groupType: Joi.string().valid('primaryUsers'),
    },
  }),
  createTargetedEmailsCampaign
);

module.exports = router;
module.exports.getTargetedTotalEmails = getTargetedTotalEmails;
module.exports.getTargetedEmailTemplates = getTargetedEmailTemplates;
module.exports.createTargetedEmailsCampaign = createTargetedEmailsCampaign;
module.exports.templateOptions = templateOptions;
