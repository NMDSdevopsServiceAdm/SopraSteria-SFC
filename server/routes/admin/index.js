// default route for admin
const express = require('express');
const router = express.Router();
const isAdmin = require('../../utils/security/isAuthenticated').isAdmin;

const search = require('./search');
const recalcWdf = require('./recalcWdf');
const registrations = require('./registrations');
const approval = require('./approval');
const parentApproval = require('./parent-approval');
const unlockAccount = require('./unlock-account');
const cqcStatusChange = require('./cqc-status-change');
const fluJab = require('./flu-jab');

// middleware authentication - only role=Admin from here on in
router.use('/', isAdmin);

router.use('/search', search);
router.use('/recalcWdf', recalcWdf);
router.use('/registrations', registrations);
router.use('/approval', approval);
router.use('/parent-approval', parentApproval);
router.use('/cqc-status-change', cqcStatusChange);
router.use('/unlock-account', unlockAccount);
router.use('/flu-jab', fluJab);

router.route('/').post(async function (req, res) {
  return res.status(200).send({success: "from admin"});
});

module.exports = router;
