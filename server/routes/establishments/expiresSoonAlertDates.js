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

const setExpiresSoonAlertDate = async (req, res) => {
  try {
    const expiresSoonAlertDate = req.body.expiresSoonAlertDate;
    await models.establishment.updateEstablishment(req.establishment.id, {
      expiresSoonAlertDate: expiresSoonAlertDate,
    });
    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').get(getExpiresSoonAlertDate);
router.route('/').post(setExpiresSoonAlertDate);

module.exports = router;
module.exports.getExpiresSoonAlertDate = getExpiresSoonAlertDate;
module.exports.setExpiresSoonAlertDate = setExpiresSoonAlertDate;
