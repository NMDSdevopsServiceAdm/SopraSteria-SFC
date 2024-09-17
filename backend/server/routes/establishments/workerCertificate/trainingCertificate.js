const { v4: uuidv4 } = require('uuid');
const express = require('express');

const config = require('../../../config/config');

const s3 = require('./s3');
const { hasPermission } = require('../../../utils/security/hasPermission');

const certificateBucket = String(config.get('workerCertificate.bucketname'));
const uploadSignedUrlExpire = config.get('workerCertificate.uploadSignedUrlExpire');
const downloadSignedUrlExpire = config.get('workerCertificate.downloadSignedUrlExpire');

const router = express.Router({ mergeParams: true });

const makeFileKey = ({ establishmentId, fileId }) => {
  return `${establishmentId}/trainingCertificate/${fileId}`;
};

const requestUploadUrl = async (req, res) => {
  const { establishmentId } = req;
  const { files } = req.body;
  if (!files || !files.length) {
    return res.status(400).send('Missing `files` param in request body');
  }

  if (!files.every((file) => file?.filename)) {
    return res.status(400).send('Missing file name in request body');
  }

  const responsePayload = [];

  for (const file of files) {
    const filename = file.filename;
    const fileId = uuidv4();
    const fileKey = makeFileKey({ establishmentId, fileId });
    const signedUrl = await s3.getSignedUrlForUpload({
      bucket: certificateBucket,
      key: fileKey,
      options: { expiresIn: uploadSignedUrlExpire },
    });
    responsePayload.push({ filename, signedUrl, fileId });
  }

  return res.status(200).json({ files: responsePayload });
};

const confirmUpload = async (req, res) => {
  const { establishmentId } = req;
  const { files } = req.body;
  if (!files || !files.length) {
    return res.status(400).send('Missing `files` param in request body');
  }

  return res.status(200).send();
};

router.route('/').post(hasPermission('canEditWorker'), requestUploadUrl);
router.route('/').put(hasPermission('canEditWorker'), confirmUpload);

module.exports = router;
module.exports.requestUploadUrl = requestUploadUrl;
