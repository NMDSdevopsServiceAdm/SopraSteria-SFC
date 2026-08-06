'use strict';

const router = require('express').Router();
const BulkUploadS3Utils = require('./s3');

const deleteFiles = async (req, res) => {
  const fileName = decodeURI(req.params.fileName);
  try {
    const foundFileList = await BulkUploadS3Utils.findFilesS3(req.establishmentId, fileName);
    if (foundFileList.length > 0) {
      await BulkUploadS3Utils.deleteFilesS3(req.establishmentId, fileName);
      res.status(200).send();
    } else {
      res.status(404).send('Not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
};
router.delete('/:fileName', deleteFiles);

module.exports = router;
module.exports.deleteFiles = deleteFiles;
