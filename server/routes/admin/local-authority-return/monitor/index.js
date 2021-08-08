'use strict';
const router = require('express').Router();
const models = require('../../../../models');
const {
  formatLaResponse,
  formatIndividualLaResponse,
} = require('../../../../services/local-authorities/local-authorities');

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

const getLocalAuthority = async (req, res) => {
  try {
    const localAuthority = await models.LocalAuthorities.findById(req.params.uid);
    const laResponse = formatIndividualLaResponse(localAuthority);
    res.status(200).send(laResponse);
  } catch (error) {
    console.log(error);
    res.sendStatus(503);
  }
};

router.get('/', getLocalAuthorities);
router.route('/:uid').get(async function (req, res) {
  await getLocalAuthority(req, res);
});

module.exports = router;
module.exports.getLocalAuthorities = getLocalAuthorities;
module.exports.getLocalAuthority = getLocalAuthority;
