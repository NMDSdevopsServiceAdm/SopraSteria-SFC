'use strict';
const router = require('express').Router();
// const models = require('../../../models');
const getLAReturnDates = async (req, res) => {
  try {
    return res.status(200).send();
    //   const getLAReturnDates = await models.dates.
  } catch (error) {}
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
