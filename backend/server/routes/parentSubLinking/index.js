// default route for getting all the parent name and postcode
'use strict';
const express = require('express');
const router = express.Router();
const Establishment = require('../../models/classes/establishment');
const Authorization = require('../../utils/security/isAuthenticated');
const { hasPermission } = require('../../utils/security/hasPermission');

// Get request to fetch all the parents name and their post code
const listParents = async (req, res) => {
  try {
    const getParentAndPostcodeDetails = await Establishment.Establishment.fetchAllParentsAndPostcode();
    if (getParentAndPostcodeDetails) {
      return res.status(201).send(getParentAndPostcodeDetails);
    } else {
      return res.status(400).send('Invalid request');
    }
  } catch (e) {
    console.error('/parentLinkingDetails/parents: ERR: ', e.message);
    return res.status(500).send({});
  }
};

router.route('/parents').get(Authorization.isAuthorised, hasPermission('canEditEstablishment'), listParents);

module.exports = router;
