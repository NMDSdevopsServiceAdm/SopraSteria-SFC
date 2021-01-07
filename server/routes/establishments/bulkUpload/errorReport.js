'use strict';

const { acquireLock } = require('./lock');
const router = require('express').Router();
const s3 = require('./s3');
const { buStates } = require('./states');
const { getErrorWarningArray } = require('../../../utils/errorWarningArray');

const errorReport = async (req, res) => {
  const establishmentsReportURI = `${req.establishmentId}/validation/establishments.validation.json`;
  const workersReportURI = `${req.establishmentId}/validation/workers.validation.json`;
  const trainingReportURI = `${req.establishmentId}/validation/training.validation.json`;

  try {
    const establishmentsReportDownload = await s3.downloadContent(establishmentsReportURI);
    const workerReportDownload = await s3.downloadContent(workersReportURI);
    const trainingReportDownload = await s3.downloadContent(trainingReportURI);

    const establishmentsReport =
      establishmentsReportDownload && establishmentsReportDownload.data
        ? JSON.parse(establishmentsReportDownload.data)
        : [];
    const workersReport =
      workerReportDownload && workerReportDownload.data ? JSON.parse(workerReportDownload.data) : [];
    const trainingReport =
      trainingReportDownload && trainingReportDownload.data ? JSON.parse(trainingReportDownload.data) : [];

    const report = {
      establishments: {
        errors: getErrorWarningArray(establishmentsReport, 'error'),
        warnings: getErrorWarningArray(establishmentsReport, 'warning'),
      },
      workers: {
        errors: getErrorWarningArray(workersReport, 'error'),
        warnings: getErrorWarningArray(workersReport, 'warning'),
      },
      training: {
        errors: getErrorWarningArray(trainingReport, 'error'),
        warnings: getErrorWarningArray(trainingReport, 'warning'),
      },
    };

    await s3.saveResponse(req, res, 200, report);
  } catch (error) {
    await s3.saveResponse(req, res, 404);
    throw new Error(error);
  }
};

router.route('/').get(acquireLock.bind(null, errorReport, buStates.DOWNLOADING));

module.exports = router;
module.exports.errorReport = errorReport;
