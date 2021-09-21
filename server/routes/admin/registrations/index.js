// default route for admin/registrations
const express = require('express');
const router = express.Router();

router.use('/', require('./getAllRegistrations'));
router.use('/', require('./getSingleRegistration'));
router.use('/updateWorkplaceId', require('./updateWorkplaceId'));
router.use('/updateRegistrationStatus', require('./updateRegistrationStatus'));
router.use('/addRegistrationNote', require('./addRegistrationNote'));

module.exports = router;
