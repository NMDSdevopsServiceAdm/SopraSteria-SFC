const express = require('express');
const router = express.Router({ mergeParams: true });
// const { hasPermission } = require('../../utils/security/hasPermission');

const getExpiresSoonAlertDate = async (req, res) => {
  try {
    // const expiresSoonAlertDate = models.establishment.getExpiresSoonAlertDate;
    const expiresSoonAlertDate = '90';
    res.status(200);
    return res.json({
      expiresSoonAlertDate,
    });
  } catch (error) {
    console.err(error);
    return res.status(500).send();
  }
};

router.route('/').get(getExpiresSoonAlertDate);

module.exports = router;
module.exports.getExpiresSoonAlertDate = getExpiresSoonAlertDate;
