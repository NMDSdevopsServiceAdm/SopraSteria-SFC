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
    const estReportDownload = await s3.downloadContent(establishmentsReportURI);
    const wrkReportDownload = await s3.downloadContent(workersReportURI);
    const trainReportDownload = await s3.downloadContent(trainingReportURI);

    const estReport = estReportDownload && estReportDownload.data ? JSON.parse(estReportDownload.data) : [];
    const wrkReport = wrkReportDownload && wrkReportDownload.data ? JSON.parse(wrkReportDownload.data) : [];
    const trainReport = trainReportDownload && trainReportDownload.data ? JSON.parse(trainReportDownload.data) : [];

    const report = {
      establishments: {
        errors: getErrorWarningArray(estReport, 'error'),
        warnings: getErrorWarningArray(estReport, 'warning'),
      },
      workers: {
        errors: getErrorWarningArray(wrkReport, 'error'),
        warnings: getErrorWarningArray(wrkReport, 'warning'),
      },
      training: {
        errors: getErrorWarningArray(trainReport, 'error'),
        warnings: getErrorWarningArray(trainReport, 'warning'),
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
