'use strict';
const config = require('../../../config/config');
const models = require('../../../models');
const { acquireLock } = require('./lock');

const s3 = new (require('aws-sdk').S3)({
  region: String(config.get('bulkupload.region')),
});
const Bucket = String(config.get('bulkupload.bucketname'));

const { Establishment } = require('../../../models/classes/establishment');
const { User } = require('../../../models/classes/user');

const EstablishmentCsvValidator = require('../../../models/BulkImport/csv/establishments').Establishment;
const WorkerCsvValidator = require('../../../models/BulkImport/csv/workers').Worker;
const TrainingCsvValidator = require('../../../models/BulkImport/csv/training').Training;

const buStates = [
  'READY',
  'DOWNLOADING',
  'UPLOADING',
  'UPLOADED',
  'VALIDATING',
  'FAILED',
  'WARNINGS',
  'PASSED',
  'COMPLETING',
  'UNKNOWN',
].reduce((acc, item) => {
  acc[item] = item;

  return acc;
}, Object.create(null));

const saveResponse = async (req, res, statusCode, body, headers) => {
  if (!Number.isInteger(statusCode) || statusCode < 100) {
    statusCode = 500;
  }

  return s3
    .putObject({
      Bucket,
      Key: `${req.establishmentId}/intermediary/${req.buRequestId}.json`,
      Body: JSON.stringify({
        url: req.url,
        startTime: req.startTime,
        endTime: new Date().toISOString(),
        responseCode: statusCode,
        responseBody: body,
        responseHeaders: typeof headers === 'object' ? headers : undefined,
      }),
    })
    .promise();
};

const determineMaxQuals = async (primaryEstablishmentId) => {
  return models.sequelize.query('select cqc.maxQualifications(:givenPrimaryEstablishment);', {
    replacements: {
      givenPrimaryEstablishment: primaryEstablishmentId,
    },
    type: models.sequelize.QueryTypes.SELECT,
  });
};

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
// the "onlyMine" parameter is used to remove those subsidiary establishments where the parent is not the owner
const restoreExistingEntities = async (
  loggedInUsername,
  primaryEstablishmentId,
  isParent,
  assocationLevel = 1,
  onlyMine = false,
  keepAlive = () => {},
) => {
  try {
    const completionBulkUploadStatus = 'COMPLETE';
    const thisUser = new User(primaryEstablishmentId);
    await thisUser.restore(null, loggedInUsername, false);

    keepAlive('begin restore entities'); // keep connection alive

    // gets a list of "my establishments", which if a parent, includes all known subsidaries too, and this "parent's" access permissions to those subsidaries
    const myEstablishments = await thisUser.myEstablishments(isParent, null);

    keepAlive('establishments retrieved'); // keep connection alive

    // having got this list of establishments, now need to fully restore each establishment as entities.
    //  using an object adding entities by a known key to make lookup comparisions easier.
    const currentEntities = [];
    const restoreEntityPromises = [];

    // first add the primary establishment entity
    const primaryEstablishment = new Establishment(loggedInUsername, completionBulkUploadStatus);
    currentEntities.push(primaryEstablishment);

    restoreEntityPromises.push(
      primaryEstablishment.restore(myEstablishments.primary.uid, false, true, assocationLevel).then((data) => {
        keepAlive('establishment restored', myEstablishments.primary.uid); // keep connection alive

        return data;
      }),
    );

    if (
      myEstablishments.subsidaries &&
      myEstablishments.subsidaries.establishments &&
      Array.isArray(myEstablishments.subsidaries.establishments)
    ) {
      myEstablishments.subsidaries.establishments = myEstablishments.subsidaries.establishments.filter(
        (est) => est.ustatus !== 'PENDING',
      );
      myEstablishments.subsidaries.establishments.forEach((thisSubsidairy) => {
        if (!onlyMine || (onlyMine && thisSubsidairy.dataOwner === 'Parent')) {
          const newSub = new Establishment(loggedInUsername, completionBulkUploadStatus);

          currentEntities.push(newSub);

          restoreEntityPromises.push(
            newSub.restore(thisSubsidairy.uid, false, true, assocationLevel).then((data) => {
              keepAlive('sub establishment restored', thisSubsidairy.uid); // keep connection alive

              return data;
            }),
          );
        }
      });
    }

    await Promise.all(restoreEntityPromises);

    return currentEntities;
  } catch (err) {
    console.error('/restoreExistingEntities: ERR: ', err.message);
    throw err;
  }
};

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

// TODO: Note, regardless of which download type is requested, the way establishments, workers and training
// entities are restored, it is easy enough to create all three exports every time. Ideally the CSV content should
// be prepared and uploaded to S3, and then signed URLs returned for the browsers to download directly, thus not
// imposing the streaming of large data files through node.js API
const downloadGet = async (req, res) => {
  // manage the request timeout
  req.setTimeout(config.get('bulkupload.validation.timeout') * 1000);

  const NEWLINE = '\r\n';

  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const isParent = req.isParent;

  const ALLOWED_DOWNLOAD_TYPES = ['establishments', 'workers', 'training'];
  const downloadType = req.params.downloadType;

  const ENTITY_RESTORE_LEVEL = 2;

  const responseText = [];

  const responseSend = async (text, stepName = '') => {
    responseText.push(text);

    console.log(`Bulk upload /download/${downloadType}: ${new Date()} ${stepName}`);
  };

  if (ALLOWED_DOWNLOAD_TYPES.includes(downloadType)) {
    try {
      const maxQuals = await determineMaxQuals(primaryEstablishmentId);
      await exportToCsv(
        NEWLINE,
        // only restore those subs that this primary establishment owns
        await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent, ENTITY_RESTORE_LEVEL, true),
        primaryEstablishmentId,
        downloadType,
        maxQuals,
        responseSend,
      );

      await saveResponse(req, res, 200, responseText.join(''), {
        'Content-Type': 'text/csv',
        'Content-disposition': `attachment; filename=${
          new Date().toISOString().split('T')[0]
        }-sfc-bulk-upload-${downloadType}.csv`,
      });
    } catch (err) {
      console.error(
        "router.get('/bulkupload/download').get: failed to restore my establishments and all associated entities (workers, qualifications and training: ",
        err,
      );

      await saveResponse(req, res, 503, {
        message: 'Failed to retrieve establishment data',
      });
    }
  } else {
    console.error(`router.get('/bulkupload/download').get: unexpected download type: ${downloadType}`, downloadType);

    await saveResponse(req, res, 400, {
      message: `Unexpected download type: ${downloadType}`,
    });
  }
};

const router = require('express').Router();

router.route('/:downloadType').get(acquireLock.bind(null, downloadGet, buStates.DOWNLOADING));

module.exports = router;
