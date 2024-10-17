const WorkerCertificateService = require('./workerCertificateService');

const express = require('express');

const models = require('../../../models');

const { hasPermission } = require('../../../utils/security/hasPermission');
const router = express.Router({ mergeParams: true });

const initialiseCertificateService = () => {
  return WorkerCertificateService.initialiseTraining();
}

const requestUploadUrlEndpoint = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    const responsePayload = await certificateService.requestUploadUrl(req.body.files, req.params.id, req.params.workerId, req.params.trainingUid);
    return res.status(200).json({ files: responsePayload });
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const confirmUploadEndpoint = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    await certificateService.confirmUpload(req.body.files, req.params.trainingUid);
    return res.status(200).send();
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const getPresignedUrlForCertificateDownloadEndpoint = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    const responsePayload = await certificateService.getPresignedUrlForCertificateDownload(req.body.files, req.params.id, req.params.workerId, req.params.trainingUid);
    return res.status(200).json({ files: responsePayload });
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const deleteCertificatesEndpoint = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    await certificateService.deleteCertificates(req.body.files, req.params.id, req.params.workerId, req.params.trainingUid);
    return res.status(200).send();
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

router.route('/').post(hasPermission('canEditWorker'), requestUploadUrlEndpoint);
router.route('/').put(hasPermission('canEditWorker'), confirmUploadEndpoint);
router.route('/download').post(hasPermission('canEditWorker'), getPresignedUrlForCertificateDownloadEndpoint);
router.route('/delete').post(hasPermission('canEditWorker'), deleteCertificatesEndpoint);

module.exports = router;
module.exports.requestUploadUrlEndpoint = requestUploadUrlEndpoint;
module.exports.confirmUploadEndpoint = confirmUploadEndpoint;
module.exports.getPresignedUrlForCertificateDownloadEndpoint = getPresignedUrlForCertificateDownloadEndpoint;
module.exports.deleteCertificatesEndpoint = deleteCertificatesEndpoint;