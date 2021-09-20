// default route for admin/registrations
const express = require('express');
const router = express.Router();

router.use('/', require('./getAllRegistrations'));
router.use('/', require('./getSingleRegistration'));
router.use('/updateWorkplaceId', require('./updateWorkplaceId'));
<<<<<<< HEAD
router.use('/updateRegistrationStatus', require('./updateRegistrationStatus'));
=======
>>>>>>> test

module.exports = router;
