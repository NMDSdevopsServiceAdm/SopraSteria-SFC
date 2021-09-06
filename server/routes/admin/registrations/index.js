// default route for admin/registrations
const express = require('express');
const { getAllRegistrations } = require('./getAllRegistrations');
const { getSingleRegistration } = require('./getSingleRegistration');

const router = express.Router();

router.route('/').get(getAllRegistrations);
router.route('/:establishmentUid').get(getSingleRegistration);

module.exports = router;
