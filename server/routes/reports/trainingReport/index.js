'use strict';
// WDF report route
const express = require('express');
const router = express.Router();

// security
const isAuthorisedEstablishment = require('../../../utils/security/isAuthenticated').hasAuthorisedEstablishment;
const { hasPermission } = require('../../../utils/security/hasPermission');

const trainingReport = require('./training');

// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
router.use('/establishment/:id', isAuthorisedEstablishment, hasPermission('canViewListOfWorkers'));

// gets the training report in excel xlsx spreadsheet format
router.use('/establishment/:id/training', [
  isAuthorisedEstablishment,
  hasPermission('canViewListOfWorkers'),
  trainingReport,
]);

module.exports = router;
