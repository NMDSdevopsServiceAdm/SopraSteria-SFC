const fs = require('fs');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'fileUploads/' });
const { parse } = require('csv-parse/sync');
const { Op } = require('sequelize');
const { celebrate, Joi, errors, Segments } = require('celebrate');
const sendEmail = require('../../../../services/email-campaigns/targeted-emails/sendEmail');
const models = require('../../../../models/');
const { getTargetedEmailTemplates } = require('./templates');

const router = express.Router();

const getGroup = async (type, establishmentNmdsIdList) => {
  const groups = {
    primaryUsers: {},
    parentOnly: { isParent: true },
    singleAccountsOnly: { isParent: false, dataOwner: 'Workplace' },
    multipleAccounts: {
      NmdsID: {
        [Op.in]: establishmentNmdsIdList,
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

const getTargetedTotalEmails = async (req, res) => {
  try {
    const establishmentNmdsIdList = parseNmdsIdsIfFileExists(req.file);
    const users = await getGroup(req.query.groupType, establishmentNmdsIdList);
    return res.status(200).send({ totalEmails: users.length });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const createTargetedEmailsCampaign = async (req, res) => {
  try {
    const establishmentNmdsIdList = parseNmdsIdsIfFileExists(req.file);

    const user = await models.user.findByUUID(req.userUid);
    const users = await getGroup(req.body.groupType, establishmentNmdsIdList);
    const templateId = parseInt(req.body.templateId);

    const emailCampaign = await createEmailCampaign(user.id);

    const history = getHistory(req, emailCampaign, templateId, users);
    await models.EmailCampaignHistory.bulkCreate(history);

    sendEmails(users, templateId);

    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const sendEmails = (users, templateId) => {
  users.map((user, index) => {
    return sendEmail.sendEmail(user, templateId, index);
  });
};

const createEmailCampaign = async (userID) => {
  const type = models.EmailCampaign.types().TARGETED_EMAILS;
  return await models.EmailCampaign.create({
    userID,
    type,
  });
};

const parseNmdsIdsIfFileExists = (file) => {
  if (!file) return null;

  const fileData = fs.readFileSync(file.path, 'utf8');
  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  return parse(fileData).map((row) => row[0]);
};

router
  .route('/total')
  .get(
    celebrate({
      [Segments.QUERY]: {
        groupType: Joi.string().valid('primaryUsers', 'parentOnly', 'singleAccountsOnly'),
      },
    }),
    getTargetedTotalEmails,
  )
  .post(
    celebrate({
      [Segments.QUERY]: {
        groupType: Joi.string().valid('multipleAccounts'),
      },
    }),
    upload.single('targetedRecipientsFile'),
    getTargetedTotalEmails,
  );

router.use('/total', errors());
router.route('/templates').get(getTargetedEmailTemplates);

router.use('/', errors());
router.route('/').post(
  celebrate({
    [Segments.BODY]: {
      templateId: Joi.string().required(),
      groupType: Joi.string().valid('primaryUsers', 'parentOnly', 'singleAccountsOnly', 'multipleAccounts'),
    },
  }),
  createTargetedEmailsCampaign,
);

module.exports = router;
module.exports.getTargetedTotalEmails = getTargetedTotalEmails;
module.exports.createTargetedEmailsCampaign = createTargetedEmailsCampaign;
