'use strict';

const router = require('express').Router();
const s3 = require('./s3');

const deleteFiles = async (req, res) => {
  const fileName = decodeURI(req.params.fileName);
  // console.log(req.params);
  try {
    const foundFileList = await s3.findFilesS3(req.establishmentId, fileName);
    console.log(foundFileList);
    if (foundFileList.length > 0) {
      await s3.deleteFilesS3(req.establishmentId, fileName);
      res.status(200).send();
    } else {
      res.status(404).send('Not found');
    }
  } catch (error) {
    console.error(error);
    res.status(503).send();
  }
};
router.delete('/:fileName', deleteFiles);

module.exports = router;
module.exports.deleteFiles = deleteFiles;
