// default route for Local Authority routes
const express = require('express');
const router = express.Router();

// endpoint security
const isAdmin = require('../../../utils/security/isAuthenticated').isAdmin;
const isAuthorisedEstablishment = require('../../../utils/security/isAuthenticated').hasAuthorisedEstablishment;
const { hasPermission } = require('../../../utils/security/hasPermission');
const userReport = require('./user');
const adminReport = require('./admin');

router.use('/admin', [isAdmin, adminReport]);
router.use('/establishment/:id/user', [
  isAuthorisedEstablishment,
  hasPermission('canRunLocalAuthorityReport'),
  userReport,
]);

router.route('/').get(async (req, res) => {
  return res.status(501).send();
});

module.exports = router;
