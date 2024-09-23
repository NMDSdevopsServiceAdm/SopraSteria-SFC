const { v4: uuidv4 } = require('uuid');
const express = require('express');

const config = require('../../../config/config');
const models = require('../../../models');

const s3 = require('./s3');
const { hasPermission } = require('../../../utils/security/hasPermission');

const certificateBucket = String(config.get('workerCertificate.bucketname'));
const uploadSignedUrlExpire = config.get('workerCertificate.uploadSignedUrlExpire');
const downloadSignedUrlExpire = config.get('workerCertificate.downloadSignedUrlExpire');

const router = express.Router({ mergeParams: true });

const makeFileKey = (establishmentId, fileId) => {
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
    const fileKey = makeFileKey(establishmentId, fileId);
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
  const { trainingUid } = req.params;
  const { files } = req.body;

  if (!files || !files.length) {
    return res.status(400).send('Missing `files` param in request body');
  }

  const trainingRecord = await models.workerTraining.findOne({
    where: {
      uid: trainingUid,
    },
    attributes: ['id', 'workerFk'],
  });

  if (!trainingRecord) {
    return res.status(400).send('Failed to find related training record');
  }

  const { workerFk, id: trainingRecordId } = trainingRecord.dataValues;

  const etagsMatchRecord = await verifyEtagsForAllFiles(establishmentId, files);
  if (!etagsMatchRecord) {
    return res.status(400).send('Failed to verify files on S3');
  }

  for (const file of files) {
    const { filename, fileId } = file;

    try {
      await models.trainingCertificates.addCertificate({ trainingRecordId, workerFk, filename, fileId });
    } catch (err) {
      console.error(err);
      return res.status(500).send('Failed to add records to database');
    }
  }

  return res.status(200).send();
};

const verifyEtagsForAllFiles = async (establishmentId, files) => {
  try {
    for (const file of files) {
      const fileKey = makeFileKey(establishmentId, file.fileId);
      const etagMatchS3Record = await s3.verifyEtag(certificateBucket, fileKey, file.etag);
      if (!etagMatchS3Record) {
        console.error('Etags in the request does not match the record at AWS bucket');
        return false;
      }
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return true;
};

router.route('/').post(hasPermission('canEditWorker'), requestUploadUrl);
router.route('/').put(hasPermission('canEditWorker'), confirmUpload);

module.exports = router;
module.exports.requestUploadUrl = requestUploadUrl;
module.exports.confirmUpload = confirmUpload;
