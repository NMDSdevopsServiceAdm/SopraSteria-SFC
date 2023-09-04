'use strict';
const router = require('express').Router();
const models = require('../../../models');

const getLocalAuthoritiesList = async (req, res) => {
  try {
    const localAuthorities = await models.cssr.findAll({attributes: ['id', 'name', 'localAuthority', 'localCustodianCode']});

    return res.status(200).send(localAuthorities);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

router.get('/', getLocalAuthoritiesList);

module.exports = router;
module.exports.getLocalAuthoritiesList = getLocalAuthoritiesList;
