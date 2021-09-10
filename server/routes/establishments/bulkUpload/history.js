const router = require('express').Router();
const S3 = require('./s3');

const getLastBulkUploadFiles = async (req, res) => {
  try {
    const results = await S3.listMetaData(req.establishmentId, '/lastBulkUpload/');
    return res.status(200).json(results);
  } catch (err) {
    console.error('get Latest Bulk Upload Files - failed', err.message);
    return res.status(500).send();
  }
};
router.route('/').get(getLastBulkUploadFiles);

module.exports = router;
module.exports.getLastBulkUploadFiles = getLastBulkUploadFiles;
