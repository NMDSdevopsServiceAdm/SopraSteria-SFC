const express = require('express');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../../utils/security/hasPermission');
const { checkIfAnyWorkerHasDHAAnswered } = require('./checkIfAnyWorkerHasDHAAnswered');

router.route('/');
router.route('/checkIfAnyWorkerHasDHAAnswered').get(hasPermission('canViewWorker'), checkIfAnyWorkerHasDHAAnswered);

module.exports = router;
