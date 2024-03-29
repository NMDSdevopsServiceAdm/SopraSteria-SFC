// default route for admin/registrations
const express = require('express');
const router = express.Router();

router.use('/', require('./getRegistrations'));
router.use('/status', require('./getSingleRegistration'));
router.use('/updateWorkplaceId', require('./updateWorkplaceId'));
router.use('/updateRegistrationStatus', require('./updateRegistrationStatus'));
router.use('/addRegistrationNote', require('./addRegistrationNote'));
router.use('/getRegistrationNotes', require('./getRegistrationNotes'));
router.use('/updatePostcode', require('./updatePostcode'));

module.exports = router;
