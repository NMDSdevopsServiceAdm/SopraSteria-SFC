'use strict';
const router = require('express').Router();
const models = require('../../../../models');
const { celebrate, Joi, errors } = require('celebrate');

const {
  formatLaResponse,
  formatIndividualLaResponse,
  formatLADatabase,
} = require('../../../../services/local-authorities/local-authorities');

const getLocalAuthorities = async (req, res) => {
  try {
    const localAuthorities = await models.LocalAuthorities.getAll();
    const laResponse = formatLaResponse(localAuthorities);

    return res.status(200).send(laResponse);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const getLocalAuthority = async (req, res) => {
  try {
    const localAuthority = await models.LocalAuthorities.findById(req.params.uid);
    const laResponse = formatIndividualLaResponse(localAuthority);
    return res.status(200).send(laResponse);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const updateLocalAuthority = async (req, res) => {
  try {
    const formattedLA = formatLADatabase(req.body);
    await models.LocalAuthorities.updateLA(req.params.uid, formattedLA);
    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const resetLocalAuthorities = async (req, res) => {
  try {
    await models.LocalAuthorities.resetLocalAuthorities();
    const localAuthorities = await models.LocalAuthorities.getAll();
    const laResponse = formatLaResponse(localAuthorities);

    return res.status(200).send(laResponse);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

router.get('/', getLocalAuthorities);
router.get(
  '/:uid',
  celebrate({
    params: {
      uid: Joi.string()
        .uuid({
          version: ['uuidv4'],
        })
        .required(),
    },
  }),
  getLocalAuthority,
);

router.post(
  '/:uid',
  celebrate({
    params: {
      uid: Joi.string()
        .uuid({
          version: ['uuidv4'],
        })
        .required(),
    },
    body: Joi.object().keys({
      workers: Joi.number(),
      status: Joi.string().valid(
        'Not updated',
        'Update, not complete',
        'Update, complete',
        'Confirmed, not complete',
        'Confirmed, complete',
      ),
      notes: Joi.string().allow(null, ''),
    }),
  }),
  updateLocalAuthority,
);

router.put('/reset', resetLocalAuthorities);

router.use('/', errors());

module.exports = router;
module.exports.getLocalAuthorities = getLocalAuthorities;
module.exports.getLocalAuthority = getLocalAuthority;
module.exports.updateLocalAuthority = updateLocalAuthority;
module.exports.resetLocalAuthorities = resetLocalAuthorities;
