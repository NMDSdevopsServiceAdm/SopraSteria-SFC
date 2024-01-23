'use strict';

const { hasPermission } = require('../../../utils/security/hasPermission');

const router = require('express').Router();

router.use('/', hasPermission('canBulkUpload'));
router.use('/signedUrl', require('./signedUrl'));
router.use('/uploaded', require('./uploaded'));
router.use('/uploadFiles', require('./uploadFiles'));
router.use('/download', require('./download'));
router.use('/errorReport', require('./errorReport'));
router.use('/delete', require('./delete'));
router.use('/validate', require('./validate'));
router.use('/complete', require('./complete'));
router.use('/report', require('./report'));
router.use('/response', require('./response'));
router.use('/history', require('./history'));
router.use(require('./lock'));
router.use('/dataChange', require('./dataChange.js'));

module.exports = router;
