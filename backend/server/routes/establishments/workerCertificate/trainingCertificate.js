const WorkerCertificateService = require('./workerCertificateService');

const express = require('express');

const models = require('../../../models');

const { hasPermission } = require('../../../utils/security/hasPermission');
const router = express.Router({ mergeParams: true });

const initialiseCertificateService = () => {
  return WorkerCertificateService.initialiseTraining();
}

const formatRequest = (req) => {
    return {
    files: req.body,
    params: {
      id: req.params.id,
      workerId: req.params.workerId,
      recordUid: req.params.trainingUid
    }
  };
}

const requestUploadUrl = async (req, res) => {
  const certificateService = initialiseCertificateService();

  const request = formatRequest(req);

  try {
    const responsePayload = await certificateService.requestUploadUrl(request);
    return res.status(200).json({ files: responsePayload });
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const confirmUpload = async (req, res) => {
  const certificateService = initialiseCertificateService();

  try {
    await certificateService.confirmUpload();
    return res.status(200).send();
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const getPresignedUrlForCertificateDownload = async (req, res) => {
  const certificateService = initialiseCertificateService();

  const request = formatRequest(req);

  try {
    const responsePayload = await certificateService.getPresignedUrlForCertificateDownload(request);
    return res.status(200).json({ files: responsePayload });
  } catch (err) {
    return res.status(err.statusCode).send(err.message);
  }
};

const deleteCertificates = async (req, res) => {
  const certificateService = initialiseCertificateService();
  const request = formatRequest(req);

  try {
    await certificateService.deleteCertificates(request);
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