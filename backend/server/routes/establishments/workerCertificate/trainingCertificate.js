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

const makeFileKey = (establishmentUid, workerId, trainingUid, fileId) => {
  return `${establishmentUid}/${workerId}/trainingCertificate/${trainingUid}/${fileId}`;
};

const requestUploadUrl = async (req, res) => {
  const { files } = req.body;
  const { id, workerId, trainingUid } = req.params;
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
    const key = makeFileKey(id, workerId, trainingUid, fileId);
    const signedUrl = await s3.getSignedUrlForUpload({
      bucket: certificateBucket,
      key,
      options: { expiresIn: uploadSignedUrlExpire },
    });
    responsePayload.push({ filename, signedUrl, fileId, key });
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
    const { filename, fileId, key } = file;

    try {
      await models.trainingCertificates.addCertificate({ trainingRecordId, workerFk, filename, fileId, key });
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
      const etagMatchS3Record = await s3.verifyEtag(certificateBucket, file.key, file.etag);
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

const getPresignedUrlForCertificateDownload = async (req, res) => {
  const { filesToDownload } = req.body;
  const { id, workerId, trainingUid } = req.params;

  if (!filesToDownload || !filesToDownload.length) {
    return res.status(400).send('No files provided in request body');
  }

  const responsePayload = [];

  for (const file of filesToDownload) {
    const signedUrl = await s3.getSignedUrlForDownload({
      bucket: certificateBucket,
      key: makeFileKey(id, workerId, trainingUid, file.uid),
      options: { expiresIn: downloadSignedUrlExpire },
    });
    responsePayload.push({ signedUrl, filename: file.filename });
  }

  return res.status(200).json({ files: responsePayload });
};

const deleteCertificates = async (req, res) => {
  const { filesToDelete } = req.body;
  const { id, workerId, trainingUid } = req.params;

  if (!filesToDelete || !filesToDelete.length) {
    return res.status(400).send('No files provided in request body');
  }

  let deletedFiles = [];
  let filesToDeleteFromS3 = [];
  let errors = [];

  for (const file of filesToDelete) {
    let deleteFromDb = null;
    let fileKey = makeFileKey(id, workerId, trainingUid, file.uid);

    try {
      deleteFromDb = await models.trainingCertificates.deleteCertificate(fileKey);
    } catch (error) {
      console.log(error);
      errors.push({ key: fileKey, error });
    }

    if (deleteFromDb) {
      filesToDeleteFromS3.push({ Key: fileKey });
    } else if (deleteFromDb !== null) {
      errors.push({ key: fileKey, error: { name: 'not found' } });
    }
  }

  let deleteFromS3Response;

  if (filesToDeleteFromS3.length > 0) {
    deleteFromS3Response = await s3.deleteCertificatesFromS3({
      bucket: certificateBucket,
      objects: filesToDeleteFromS3,
    });
  }

  if (deleteFromS3Response?.Deleted) {
    for (const fileDeletedFromS3 of deleteFromS3Response?.Deleted) {
      deletedFiles.push(fileDeletedFromS3.Key);
    }
  }

  if (deletedFiles.length === 0 && errors.length > 0) {
    return res.status(400).json({ errors });
  } else {
    return res.status(200).json({ deletedFiles, errors });
  }
};

router.route('/').post(hasPermission('canEditWorker'), requestUploadUrl);
router.route('/').put(hasPermission('canEditWorker'), confirmUpload);
router.route('/download').post(hasPermission('canEditWorker'), getPresignedUrlForCertificateDownload);
router.route('/delete').post(hasPermission('canEditWorker'), deleteCertificates);

module.exports = router;
module.exports.requestUploadUrl = requestUploadUrl;
module.exports.confirmUpload = confirmUpload;
module.exports.getPresignedUrlForCertificateDownload = getPresignedUrlForCertificateDownload;
module.exports.deleteCertificates = deleteCertificates;
