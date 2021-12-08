const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
// const { hasPermission } = require('../../utils/security/hasPermission');

const getExpiresSoonAlertDate = async (req, res) => {
  try {
    const expiresSoonAlertDate = await models.establishment.getExpiresSoonAlertDate(req.establishment.id);
    res.status(200);
    return res.json({
      expiresSoonAlertDate: expiresSoonAlertDate.get('ExpiresSoonAlertDate'),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').get(getExpiresSoonAlertDate);

module.exports = router;
module.exports.getExpiresSoonAlertDate = getExpiresSoonAlertDate;
