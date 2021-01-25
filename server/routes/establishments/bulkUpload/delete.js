'use strict';

const router = require('express').Router();
const s3 = require('./s3');

const deleteFiles = (req) => {
  s3.deleteFilesS3(req.establishmentId, req.filename);
};
router.delete('/', deleteFiles);

module.exports = router;
module.exports.deleteFiles = deleteFiles;
