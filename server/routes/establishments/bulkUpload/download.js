'use strict';
const config = require('../../../config/config');
const models = require('../../../models');

const EstablishmentCsvValidator = require('../../../models/BulkImport/csv/establishments').Establishment;
const { getWorkerHeadersWithExtraQuals } = require('../bulkUpload/validate/headers/worker');
const { trainingHeaders } = require('./data/trainingHeaders');
const WorkerCSV = require('./download/workerCSV');
const TrainingCSV = require('./download/trainingCSV');

const { buStates } = require('./states');
const s3 = require('./s3');

const NEWLINE = '\r\n';

const establishmentCsv = async (establishments, responseSend) => {
  responseSend(EstablishmentCsvValidator.headers());

  establishments.map((establishment) => responseSend(NEWLINE + EstablishmentCsvValidator.toCSV(establishment)));
};

const workerCsv = async (establishments, responseSend) => {
  let maxQualifications = 3;

  establishments.map((establishment) => {
    establishment.workers.map((worker) => {
      if (worker.qualifications.length > maxQualifications) maxQualifications = worker.qualifications.length;
    });
  });

  responseSend(getWorkerHeadersWithExtraQuals(maxQualifications));

  establishments.map((establishment) =>
    establishment.workers.map((worker) =>
      responseSend(NEWLINE + WorkerCSV.toCSV(establishment.LocalIdentifierValue, worker, maxQualifications)),
    ),
  );
};

const trainingCsv = async (establishments, responseSend) => {
  responseSend(trainingHeaders);

  establishments.map((establishment) =>
    establishment.workers.map((worker) =>
      worker.workerTraining.map((trainingRecord) =>
        responseSend(
          NEWLINE + TrainingCSV.toCSV(establishment.LocalIdentifierValue, worker.LocalIdentifierValue, trainingRecord),
        ),
      ),
    ),
  );
};

const downloadGet = async (req, res) => {
  // manage the request timeout
  req.setTimeout(config.get('bulkupload.validation.timeout') * 1000);

  const primaryEstablishmentId = req.establishment.id;

  const ALLOWED_DOWNLOAD_TYPES = ['establishments', 'workers', 'training'];
  const renameDownloadType = {
    establishments: 'workplace',
    workers: 'staff',
    training: 'training',
  };

  const downloadType = req.params.downloadType;

  const responseText = [];

  let count = 0;

  const logAmount = downloadType !== 'establishments' ? 50 : 10;

  const responseSend = async (text, stepName = '') => {
    responseText.push(text);

    if (count % logAmount === 0) {
      console.log(`Bulk upload /download/${downloadType}: ${new Date()} ${stepName} count:${count}`);
    }
    count++;
  };

  if (ALLOWED_DOWNLOAD_TYPES.includes(downloadType)) {
    try {
      switch (downloadType) {
        case 'establishments': {
          const establishments = await models.establishment.downloadEstablishments(primaryEstablishmentId);
          establishmentCsv(establishments, responseSend);
          break;
        }
        case 'workers': {
          const workers = await models.establishment.downloadWorkers(primaryEstablishmentId);

          workerCsv(workers, responseSend);
          break;
        }
        case 'training': {
          const trainingRecords = await models.establishment.downloadTrainingRecords(primaryEstablishmentId);

          trainingCsv(trainingRecords, responseSend);
          break;
        }
      }

      const filename = renameDownloadType[downloadType];

      await s3.saveResponse(req, res, 200, responseText.join(''), {
        'Content-Type': 'text/csv',
        'Content-disposition': `attachment; filename=${
          new Date().toISOString().split('T')[0]
        }-sfc-bulk-upload-${filename}.csv`,
      });
    } catch (err) {
      console.error(
        "router.get('/bulkupload/download').get: failed to restore my establishments and all associated entities (workers, qualifications and training: ",
        err,
      );

      await s3.saveResponse(req, res, 500, {
        message: 'Failed to retrieve establishment data',
      });
    }
  } else {
    console.error(`router.get('/bulkupload/download').get: unexpected download type: ${downloadType}`, downloadType);
    await s3.saveResponse(req, res, 400, {
      message: `Unexpected download type: ${downloadType}`,
    });
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/:downloadType').get(acquireLock.bind(null, downloadGet, buStates.DOWNLOADING, true));

module.exports = router;
module.exports.downloadGet = downloadGet;
module.exports.workerCsv = workerCsv;
