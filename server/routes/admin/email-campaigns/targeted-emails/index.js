const express = require('express');
const router = express.Router();

const getTargetedTotalEmails = async (req, res) => {
  return res.status(200).send({totalEmails: 1500});
}

router.route('/total').get(getTargetedTotalEmails);

module.exports = router;
module.exports.getTargetedTotalEmails = getTargetedTotalEmails;
