const fs = require('fs');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'fileUploads/' });
const { parse } = require('csv-parse/sync');
const { Op } = require('sequelize');
const { celebrate, Joi, errors, Segments } = require('celebrate');
const sendInBlue = require('../../../../utils/email/sendInBlueEmail');
const sendEmail = require('../../../../services/email-campaigns/targeted-emails/sendEmail');
const models = require('../../../../models/');

const router = express.Router();

const getGroup = async (type, establishmentIdList) => {
  const groups = {
    primaryUsers: {},
    parentOnly: { isParent: true },
    singleAccountsOnly: { isParent: false, dataOwner: 'Workplace' },
    multipleAccounts: {
      EstablishmentID: {
        [Op.in]: establishmentIdList,
      },
    },
  };

  return await models.user.allPrimaryUsers(groups[type]);
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
    const users = await getGroup(req.query.groupType, req.query.establishmentIdList);
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

const uploadAndValidMultipleAccounts = async (req, res) => {
  try {
    // read and parse CSV data
    const fileData = fs.readFileSync(req.file.path, 'utf8');
    req.query.establishmentIdList = parse(fileData).map((row) => row[0]);

    return await getTargetedTotalEmails(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router
  .route('/validateTargetedRecipients')
  .post(upload.single('targetedRecipientsFile'), uploadAndValidMultipleAccounts);

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
module.exports.uploadAndValidMultipleAccounts = uploadAndValidMultipleAccounts;
module.exports.templateOptions = templateOptions;
