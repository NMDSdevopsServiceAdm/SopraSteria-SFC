const express = require('express');
const router = express.Router();
const { sendEmailsResultRouter } = require('./send-emails-result');

router.use('/inactive-workplaces', require('./inactive-workplaces'));
router.use('/targeted-emails', require('./targeted-emails'));
router.use('/send-emails-result', sendEmailsResultRouter);

module.exports = router;
