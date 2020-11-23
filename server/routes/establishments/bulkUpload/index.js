'use strict';

const router = require('express').Router();

router.use('/signedUrl', require('./signedUrl'));
router.use('/uploaded', require('./uploaded'));
router.use('/download', require('./download'));
router.use('/validate', require('./validate'));
router.use('/complete', require('./complete'));
router.use('/report', require('./report'));
router.use('/response', require('./response'));
router.use(require('./lock'));

module.exports = router;
