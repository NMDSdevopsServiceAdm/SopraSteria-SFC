// default route for admin
const express = require('express');
const router = express.Router();
const isAdmin = require('../../utils/security/isAuthenticated').isAdmin;

const search = require('./search');

// middleware authentication - only role=Admin from here on in
router.use('/', isAdmin);

router.use('/search', search);

router.route('/').post(async function (req, res) {
  return res.status(200).send({success: "from admin"});
});

module.exports = router;
