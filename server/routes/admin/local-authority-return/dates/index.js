'use strict';
const router = require('express').Router();
const models = require('../../../../models');
const { celebrate, Joi, errors } = require('celebrate');

const getLAReturnDates = async (req, res) => {
  try {
    const laReturnStartDate = await models.AdminSettings.getValue('laReturnStartDate');
    const laReturnEndDate = await models.AdminSettings.getValue('laReturnEndDate');

    return res.status(200).send({
      laReturnStartDate: new Date(laReturnStartDate.Data.value),
      laReturnEndDate: new Date(laReturnEndDate.Data.value),
    });
  } catch (error) {
    console.error(error);
    return res.status(503).send();
  }
};

const setLAReturnDates = async (req, res) => {
  try {
    const [laReturnStartDateCount] = await models.AdminSettings.setValue('laReturnStartDate', {
      type: 'date',
      value: req.body.laReturnStartDate,
    });
    const [laReturnEndDateCount] = await models.AdminSettings.setValue('laReturnEndDate', {
      type: 'date',
      value: req.body.laReturnEndDate,
    });

    if (laReturnStartDateCount === 0 || laReturnEndDateCount === 0) {
      throw new Error("Couldn't find columns to update");
    }

    return res.status(200).send({
      laReturnStartDate: new Date(req.body.laReturnStartDate),
      laReturnEndDate: new Date(req.body.laReturnEndDate),
    });
  } catch (error) {
    console.error(error);
    if (error.message === "Couldn't find columns to update") {
      return res.status(404).send();
    } else {
      return res.status(503).send();
    }
  }
};

router.get('/', getLAReturnDates);

router.route('/').post(
  celebrate({
    body: Joi.object().keys({
      laReturnStartDate: Joi.date().required(),
      laReturnEndDate: Joi.date()
        .ruleset.greater(Joi.ref('laReturnStartDate'))
        .rule({ message: 'laReturnEndDate must be greater than laReturnStartDate' })
        .required(),
    }),
  }),
  setLAReturnDates,
);

router.use('/', errors());

module.exports = router;
module.exports.getLAReturnDates = getLAReturnDates;
module.exports.setLAReturnDates = setLAReturnDates;
