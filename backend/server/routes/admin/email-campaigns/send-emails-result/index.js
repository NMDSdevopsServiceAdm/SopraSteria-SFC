const express = require('express');
const router = express.Router();

const redisStore = require('./loadSendEmailsResult');
const models = require('../../../../models');

const getSendEmailsResult = async (_req, res) => {
  try {
    const result = await redisStore.loadSendEmailsResult();
    const todayTotalCount = await models.EmailCampaignHistory.countToday();
    const responseBody = { ...result, todayTotalCount };
    return res.status(200).send(responseBody);
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').get(getSendEmailsResult);

module.exports = { sendEmailsResultRouter: router, getSendEmailsResult };
