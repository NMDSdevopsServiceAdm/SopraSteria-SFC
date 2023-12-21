const fs = require('fs');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: './uploads/' });
const { parse } = require('csv-parse/sync');
const { Op } = require('sequelize');
const { celebrate, Joi, errors, Segments } = require('celebrate');
const sendEmail = require('../../../../services/email-campaigns/targeted-emails/sendEmail');
const models = require('../../../../models/');
const { getTargetedEmailTemplates } = require('./templates');
const { sanitizeFilePath } = require('../../../../utils/security/sanitizeFilePath');
const moment = require('moment');
const excelJS = require('exceljs');
const targetedEmailsReport = require('../../../../reports/targeted-emails');

const router = express.Router();

const handleMultipleAccountsFormData = (req) => {
  const { jsonPayload, targetedRecipientsFile } = req.files;
  const jsonData = parseJSONPayloadIfExists(jsonPayload[0]);

  req.body.groupType = jsonData.groupType;
  req.body.templateId = jsonData.templateId;

  req.file = targetedRecipientsFile[0];
};

const createTargetedEmailsCampaign = async (req, res) => {
  if (req.files && req.files.jsonPayload && req.files.targetedRecipientsFile) {
    handleMultipleAccountsFormData(req);
  }

  try {
    const establishmentNmdsIdList = parseNmdsIdsIfFileExists(req.file);

    const user = await models.user.findByUUID(req.userUid);
    const users = await getGroupOfUsers(req.body.groupType, establishmentNmdsIdList);
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

const getTargetedTotalEmails = async (req, res) => {
  try {
    const establishmentNmdsIdList = parseNmdsIdsIfFileExists(req.file);
    const users = await getGroupOfUsers(req.query.groupType, establishmentNmdsIdList);
    return res.status(200).send({ totalEmails: users.length });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const getGroupOfUsers = async (type, establishmentNmdsIdList) => {
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

const createTargetedEmailsReport = async (req, res) => {
  try {
    const establishmentNmdsIdList = parseNmdsIdsIfFileExists(req.file);
    const users = await getGroupOfUsers('multipleAccounts', establishmentNmdsIdList);

    const workbook = new excelJS.Workbook();

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    await targetedEmailsReport.generateTargetedEmailsReport(workbook, users, establishmentNmdsIdList);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + moment().format('DD-MM-YYYY') + '-targetedEmails.xlsx',
    );

    await workbook.xlsx.write(res);

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const parseNmdsIdsIfFileExists = (file) => {
  if (!file) return null;

  const path = sanitizeFilePath(file.filename, 'uploads');
  const fileData = fs.readFileSync(path, 'utf8');
  if (fs.existsSync(path)) fs.unlinkSync(path);
  return parse(fileData).map((row) => row[0]);
};

const parseJSONPayloadIfExists = (data) => {
  if (!data) return null;

  const path = sanitizeFilePath(data.filename, 'uploads');
  const jsonData = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (fs.existsSync(path)) fs.unlinkSync(path);
  return jsonData;
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
    [Segments.BODY]: Joi.object().keys({
      templateId: Joi.string().when('groupType', { is: Joi.exist(), then: Joi.string().required() }),
      groupType: Joi.string().valid('primaryUsers', 'parentOnly', 'singleAccountsOnly'),
    }),
  }),
  upload.fields([
    { name: 'targetedRecipientsFile', maxCount: 1 },
    { name: 'jsonPayload', maxCount: 1 },
  ]),
  createTargetedEmailsCampaign,
);

router.route('/report').post(upload.single('targetedRecipientsFile'), createTargetedEmailsReport);

module.exports = router;
module.exports.getTargetedTotalEmails = getTargetedTotalEmails;
module.exports.createTargetedEmailsCampaign = createTargetedEmailsCampaign;
module.exports.getGroupOfUsers = getGroupOfUsers;
module.exports.createTargetedEmailsReport = createTargetedEmailsReport;
