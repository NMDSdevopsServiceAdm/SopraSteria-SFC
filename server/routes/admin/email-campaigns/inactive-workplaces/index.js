const express = require('express');
const router = express.Router();
const moment = require('moment');

const models = require('../../../../models');
const findInactiveWorkplaces = require('../../../../services/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const findParentWorkplaces = require('../../../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');
const sendEmail = require('../../../../services/email-campaigns/inactive-workplaces/sendEmail');

const getInactiveWorkplaces = async (_req, res) => {
  try {
    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();
    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

    return res.json({
      inactiveWorkplaces: inactiveWorkplaces.length + parentWorkplaces.length,
      workplacesForDeleting: inactiveWorkplaces.filter((workplace) => {
        return moment(workplace.lastUpdated) <= moment().subtract(2, 'years').endOf('month').endOf('days');
      }),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({});
  }
};

const createCampaign = async (req, res) => {
  try {
    const user = await models.user.findByUUID(req.userUid);

    const type = models.EmailCampaign.types().INACTIVE_WORKPLACES;
    const emailCampaign = await models.EmailCampaign.create({
      userID: user.id,
      type: type,
    });

    const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();
    const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

    const totalInactiveWorkplaces = inactiveWorkplaces.concat(parentWorkplaces);
    const history = totalInactiveWorkplaces.map((workplace) => {
      return {
        emailCampaignID: emailCampaign.id,
        establishmentID: workplace.id,
        template: workplace.emailTemplate.id,
        data: {
          dataOwner: workplace.dataOwner,
          lastUpdated: workplace.lastUpdated,
          subsidiaries: workplace.subsidiaries ? workplace.subsidiaries : [],
        },
        sentToName: workplace.user.name,
        sentToEmail: workplace.user.email,
      };
    });

    await models.EmailCampaignHistory.bulkCreate(history);

    totalInactiveWorkplaces.map((inactiveWorkplace, index) => {
      return sendEmail.sendEmail(inactiveWorkplace, index);
    });

    return res.json({
      date: emailCampaign.createdAt,
      emails: totalInactiveWorkplaces.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json();
  }
};

const getHistory = async (_req, res) => {
  const type = models.EmailCampaign.types().INACTIVE_WORKPLACES;
  const emailCampaigns = await models.EmailCampaign.getHistory(type);

  const history = emailCampaigns.map((campaign) => {
    const { createdAt, emails } = campaign.toJSON();

    return {
      date: moment(createdAt).format('YYYY-MM-DD'),
      emails: emails,
    };
  });

  return res.json(history);
};

router.route('/').get(getInactiveWorkplaces);
router.route('/').post(createCampaign);
router.route('/history').get(getHistory);
router.use('/report', require('./report'));

module.exports = router;
module.exports.createCampaign = createCampaign;
module.exports.getHistory = getHistory;
module.exports.getInactiveWorkplaces = getInactiveWorkplaces;
