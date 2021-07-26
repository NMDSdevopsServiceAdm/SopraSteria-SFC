'use strict';
const router = require('express').Router();
const models = require('../../../../models');

const getLAReturnDates = async (req, res) => {
  try {
    const dates = await models.AdminSettings.getLADates();

    console.log(dates);
    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(503).send();
  }
};

const setLAReturnDates = async (req, res) => {
  // try {
  //   console.log(req.body);
  // } catch (error) {
  //   console.log(error);
  // }
};

router.get('/', getLAReturnDates);
// Celebrate
router.post('/', setLAReturnDates);

module.exports = router;
module.exports.getLAReturnDates = getLAReturnDates;
module.exports.setLAReturnDates = setLAReturnDates;
