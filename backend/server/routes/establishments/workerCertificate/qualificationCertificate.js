const WorkerCertificateService = require('./workerCertificateService');

const express = require('express');
const models = require('../../../models');

const { hasPermission } = require('../../../utils/security/hasPermission');
const router = express.Router({ mergeParams: true });

const initialiseCertificateService = () => {
  return WorkerCertificateService.initialiseQualifications();
}

const requestUploadUrl = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    const responsePayload = await certificateService.requestUploadUrl(req.body.files, req.params.id, req.params.workerId, req.params.qualificationUid);
    return res.status(200).json({ files: responsePayload });
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const confirmUpload = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    await certificateService.confirmUpload(req.body.files, req.params.qualificationUid);
    return res.status(200).send();
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const getPresignedUrlForCertificateDownload = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    const responsePayload = await certificateService.getPresignedUrlForCertificateDownload(req.body.files, req.params.id, req.params.workerId, req.params.qualificationUid);
    return res.status(200).json({ files: responsePayload });
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const deleteCertificates = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    await certificateService.deleteCertificates(req.body.files, req.params.id, req.params.workerId, req.params.qualificationUid);
    return res.status(200).send();
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
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