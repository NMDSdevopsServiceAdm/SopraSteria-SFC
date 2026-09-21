const express = require('express');
const router = express.Router();

const redisStore = require('./loadSendEmailsResult');

const getSendEmailsResult = async (_req, res) => {
  try {
    const result = await redisStore.loadSendEmailsResult();
    return res.status(200).send(result);
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').get(getSendEmailsResult);

module.exports = { sendEmailsResultRouter: router, getSendEmailsResult };
