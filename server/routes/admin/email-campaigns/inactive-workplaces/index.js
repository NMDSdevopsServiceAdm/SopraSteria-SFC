const express = require('express');
const router = express.Router();
const moment = require('moment');

const models = require('../../../../models');
const findInactiveWorkplaces = require('./findInactiveWorkplaces');
const sendEmail = require('./sendEmail');

const getInactiveWorkplaces = async (_, res) => {
  const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

  return res.json({
    inactiveWorkplaces: inactiveWorkplaces.length,
  });
}

const createCampaign = async (req, res) => {
  try {
    const user = await models.user.findByUUID(req.userUid);

    const emailCampaign = await models.EmailCampaign.create({
      userID: user.id,
    });

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();
    const history = inactiveWorkplaces.map((workplace) => {
      return {
        emailCampaignID: emailCampaign.id,
        establishmentID: workplace.id,
        type: 'inactiveWorkplaces',
        template: workplace.emailTemplateId,
        data: {
          dataOwner: workplace.dataOwner,
          lastUpdated: workplace.lastUpdated,
        },
        sentToName: workplace.user.name,
        sentToEmail: workplace.user.email,
      };
    });

    models.EmailCampaignHistory.bulkCreate(history);
    inactiveWorkplaces.map(sendEmail.sendEmail);

    return res.json({
      date: emailCampaign.createdAt,
      emails: inactiveWorkplaces.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(503).json();
  }
}

const getHistory = async (_, res) => {
  const emailCampaigns = await models.EmailCampaign.findAll({
    attributes: [
      'createdAt',
      [
        models.sequelize.fn('COUNT', models.sequelize.col('"emailCampaignHistories"."id"')), 'emails'
      ],
    ],
    include: [{
      model: models.EmailCampaignHistory,
      attributes: [], as: 'emailCampaignHistories'
    }],
    group: [
      'EmailCampaign.id',
    ]
  });

  const history = emailCampaigns.map((campaign) => {
    const { createdAt, emails } = campaign.toJSON();

    return {
      date: moment(createdAt).format('YYYY-MM-DD'),
      emails: emails,
    };
  });

  return res.json(history);
}

router.route('/').get(getInactiveWorkplaces);
router.route('/').post(createCampaign);
router.route('/history').get(getHistory);
router.use('/report', require('./report'));

module.exports = router;
module.exports.createCampaign = createCampaign;
module.exports.getHistory = getHistory;
module.exports.getInactiveWorkplaces = getInactiveWorkplaces;
