'use strict';
const router = require('express').Router();
const models = require('../../../../models');
const { formatLaResponse } = require('../../../../services/local-authorities/local-authorities');

const getLocalAuthorities = async (req, res) => {
  try {
    const localAuthorities = await models.LocalAuthorities.getAll();
    const laResponse = formatLaResponse(localAuthorities);

    return res.status(200).send(laResponse);
  } catch (error) {
    console.error(error);
    return res.sendStatus(503);
  }
};

router.get('/', getLocalAuthorities);

module.exports = router;
module.exports.getLocalAuthorities = getLocalAuthorities;
