const express = require('express');
const router = express.Router();

// middleware authentication - only role=Admin from here on in
const { isAdmin } = require('../../utils/security/isAuthenticated');
router.use('/', isAdmin);

router.use('/search', require('./search'));
router.use('/recalcWdf', require('./recalcWdf'));
router.use('/registrations', require('./registrations'));
router.use('/approval', require('./approval'));
router.use('/parent-approval', require('./parent-approval'));
router.use('/cqc-status-change', require('./cqc-status-change'));
router.use('/unlock-account', require('./unlock-account'));
router.use('/email-campaigns', require('./email-campaigns'));
router.use('/move-workplace', require('./move-workplace'));
router.use('/local-authority-return', require('./local-authority-return'));
router.use('/remove-parent-status', require('./remove-parent-status'));
router.use('/admin-users', require('./admin-users'));

router.route('/').post(async function (req, res) {
  return res.status(200).send({ success: 'from admin' });
});

module.exports = router;
