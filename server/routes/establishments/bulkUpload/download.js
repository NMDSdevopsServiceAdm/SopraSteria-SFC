'use strict';
const config = require('../../../config/config');
const models = require('../../../models');

const EstablishmentCsvValidator = require('../../../models/BulkImport/csv/establishments').Establishment;
const WorkerCsvValidator = require('../../../models/BulkImport/csv/workers').Worker;
const TrainingCsvValidator = require('../../../models/BulkImport/csv/training').Training;

const { buStates } = require('./states');
const s3 = require('./s3');

const NEWLINE = '\r\n';

const determineMaxQuals = async (primaryEstablishmentId) => {
  return models.sequelize.query('select cqc.maxQualifications(:givenPrimaryEstablishment);', {
    replacements: {
      givenPrimaryEstablishment: primaryEstablishmentId,
    },
    type: models.sequelize.QueryTypes.SELECT,
  });
};

const { restoreExistingEntities } = require('./entities');

// takes the given set of establishments, and returns the string equivalent of each of the establishments, workers and training CSV
const exportToCsv = async (
  NEWLINE,
  allMyEstablishments,
  primaryEstablishmentId,
  downloadType,
  maxQuals,
  responseSend,
) => {
  // before being able to write the worker header, we need to know the maximum number of qualifications
  // columns across all workers

  if (maxQuals && maxQuals[0].maxqualifications && Number.isInteger(parseInt(maxQuals[0].maxqualifications, 10))) {
    const MAX_QUALS = parseInt(maxQuals[0].maxqualifications, 10);

    // first the header rows
    let columnNames = '';

    switch (downloadType) {
      case 'establishments':
        columnNames = EstablishmentCsvValidator.headers();
        break;

      case 'workers':
        columnNames = WorkerCsvValidator.headers(MAX_QUALS);
        break;

      case 'training':
        columnNames = TrainingCsvValidator.headers();
        break;
    }

    responseSend(columnNames, 'column names');

    allMyEstablishments.forEach((thisEstablishment) => {
      if (downloadType === 'establishments') {
        responseSend(NEWLINE + EstablishmentCsvValidator.toCSV(thisEstablishment), 'establishment');
      } else {
        // for each worker on this establishment
        thisEstablishment.workers.forEach((thisWorker) => {
          // note - thisEstablishment.name will need to be local identifier once available
          if (downloadType === 'workers') {
            responseSend(
              NEWLINE + WorkerCsvValidator.toCSV(thisEstablishment.localIdentifier, thisWorker, MAX_QUALS),
              'worker',
            );
          } else if (thisWorker.training) {
            // or for this Worker's training records
            thisWorker.training.forEach((thisTrainingRecord) => {
              responseSend(
                NEWLINE +
                  TrainingCsvValidator.toCSV(
                    thisEstablishment.key,
                    thisWorker.localIdentifier ? thisWorker.localIdentifier : '',
                    thisTrainingRecord,
                  ),
                'training',
              );
            });
          }
        });
      }
    });
  } else {
    console.error('bulk upload exportToCsv - max quals error: ', maxQuals);
    throw new Error('max quals error: determineMaxQuals');
  }
};

const establishmentCsv = async (establishments, responseSend) => {
  responseSend(EstablishmentCsvValidator.headers());

  establishments.map((establishment) => {
    responseSend(NEWLINE + EstablishmentCsvValidator.toCSV(establishment));
  });
};
// TODO: Note, regardless of which download type is requested, the way establishments, workers and training
// entities are restored, it is easy enough to create all three exports every time. Ideally the CSV content should
// be prepared and uploaded to S3, and then signed URLs returned for the browsers to download directly, thus not
// imposing the streaming of large data files through node.js API
const downloadGet = async (req, res) => {
  // manage the request timeout
  req.setTimeout(config.get('bulkupload.validation.timeout') * 1000);

  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const isParent = req.isParent;

  const ALLOWED_DOWNLOAD_TYPES = ['establishments', 'workers', 'training'];
  const renameDownloadType = {
    establishments: 'workplace',
    workers: 'staff',
    training: 'training',
  };

  const downloadType = req.params.downloadType;

  const ENTITY_RESTORE_LEVEL = 2;

  const responseText = [];

  const responseSend = async (text, stepName = '') => {
    responseText.push(text);

    console.log(`Bulk upload /download/${downloadType}: ${new Date()} ${stepName}`);
  };

  if (ALLOWED_DOWNLOAD_TYPES.includes(downloadType)) {
    try {
      switch (downloadType) {
        case 'establishments': {
          const establishments = await models.establishment.downloadEstablishments(primaryEstablishmentId);
          establishmentCsv(establishments, responseSend);
          break;
        }
        default: {
          const maxQuals = await determineMaxQuals(primaryEstablishmentId);
          await exportToCsv(
            NEWLINE,
            // only restore those subs that this primary establishment owns
            await restoreExistingEntities(
              theLoggedInUser,
              primaryEstablishmentId,
              isParent,
              ENTITY_RESTORE_LEVEL,
              true,
            ),
            primaryEstablishmentId,
            downloadType,
            maxQuals,
            responseSend,
          );
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

      await s3.saveResponse(req, res, 503, {
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

router.route('/:downloadType').get(acquireLock.bind(null, downloadGet, buStates.DOWNLOADING));

module.exports = router;
module.exports.exportToCsv = exportToCsv;
module.exports.downloadGet = downloadGet;
