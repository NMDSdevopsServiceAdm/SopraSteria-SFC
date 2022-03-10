// default route for admin/registrations
const express = require('express');
const router = express.Router();

router.use('/', require('./getAllRegistrations'));
router.use('/', require('./getRegistrations'));
router.use('/status', require('./getSingleRegistration'));
router.use('/updateWorkplaceId', require('./updateWorkplaceId'));
router.use('/updateRegistrationStatus', require('./updateRegistrationStatus'));
router.use('/addRegistrationNote', require('./addRegistrationNote'));
router.use('/getRegistrationNotes', require('./getRegistrationNotes'));

module.exports = router;
