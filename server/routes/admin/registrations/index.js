// default route for admin/registrations
const express = require('express');
const { getAllRegistrations } = require('./getAllRegistrations');
const { getSingleRegistration } = require('./getSingleRegistration');
const { updateWorkplaceId } = require('./updateWorkplaceId');

const router = express.Router();

router.route('/').get(getAllRegistrations);
router.route('/:establishmentUid').get(getSingleRegistration);
router.route('/updateWorkplaceId').post(updateWorkplaceId);

module.exports = router;
