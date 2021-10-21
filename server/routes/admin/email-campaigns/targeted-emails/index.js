const express = require('express');
const { celebrate, Joi, errors, Segments } = require('celebrate');
const sendInBlue = require('../../../../utils/email/sendInBlueEmail');
const sendEmail = require('../../../../services/email-campaigns/targeted-emails/sendEmail');
const models = require('../../../../models/');

const router = express.Router();

const getGroup = async (type) => {
  const groups = {
    primaryUsers: await models.user.allPrimaryUsers(),
    parentOnly: await models.user.allPrimaryUsers({ isParent: true }),
    singleAccountsOnly: await models.user.allPrimaryUsers({ isParent: false, dataOwner: 'Workplace' }),
  };
  return groups[type];
};

const getHistory = (req, emailCampaign, templateId, users) =>
  users.map((user) => {
    return {
      emailCampaignID: emailCampaign.id,
      establishmentID: user.establishment.id,
      template: templateId,
      data: {
        type: req.body.groupType,
      },
      sentToName: user.FullNameValue,
      sentToEmail: user.get('email'),
    };
  });

const templateOptions = {
  templateStatus: true, // Boolean | Filter on the status of the template. Active = true, inactive = false
  limit: 50, // Number | Number of documents returned per page
  offset: 0, // Number | Index of the first document in the page
  sort: 'desc', // String | Sort the results in the ascending/descending order of record creation. Default order is **descending** if `sort` is not passed
};

const getTargetedTotalEmails = async (req, res) => {
  try {
    const users = await getGroup(req.query.groupType);
    return res.status(200).send({ totalEmails: users.length });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
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
    const user = await models.user.findByUUID(req.userUid);
    const users = await getGroup(req.body.groupType);
    const templateId = parseInt(req.body.templateId);

    const type = models.EmailCampaign.types().TARGETED_EMAILS;
    const emailCampaign = await models.EmailCampaign.create({
      userID: user.id,
      type: type,
    });

    const history = getHistory(req, emailCampaign, templateId, users);
    await models.EmailCampaignHistory.bulkCreate(history);

    users.map((user, index) => {
      return sendEmail.sendEmail(user, templateId, index);
    });

    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/total').get(
  celebrate({
    [Segments.QUERY]: {
      groupType: Joi.string().valid('primaryUsers', 'parentOnly', 'singleAccountsOnly'),
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
      groupType: Joi.string().valid('primaryUsers', 'parentOnly', 'singleAccountsOnly'),
    },
  }),
  createTargetedEmailsCampaign,
);

module.exports = router;
module.exports.getTargetedTotalEmails = getTargetedTotalEmails;
module.exports.getTargetedEmailTemplates = getTargetedEmailTemplates;
module.exports.createTargetedEmailsCampaign = createTargetedEmailsCampaign;
module.exports.templateOptions = templateOptions;
