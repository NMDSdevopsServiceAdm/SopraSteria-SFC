'use strict';
const config = require('../../../config/config');
const dbModels = require('../../../models');
const timerLog = require('../../../utils/timerLog');
const { acquireLock } = require('./lock');

const s3 = new (require('aws-sdk').S3)({
  region: String(config.get('bulkupload.region')),
});
const Bucket = String(config.get('bulkupload.bucketname'));

const { sendCountToSlack } = require('./slack');

const { Establishment } = require('../../../models/classes/establishment');
const { User } = require('../../../models/classes/user');

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

const downloadContent = async (key, size, lastModified) => {
  try {
    const filenameRegex = /^(.+\/)*(.+)\.(.+)$/;

    return await s3
      .getObject({
        Bucket,
        Key: key,
      })
      .promise()
      .then((objData) => ({
        key,
        data: objData.Body.toString(),
        filename: key.match(filenameRegex)[2] + '.' + key.match(filenameRegex)[3],
        username: objData.Metadata.username,
        size,
        lastModified,
      }));
  } catch (err) {
    console.error(`api/establishment/bulkupload/downloadFile: ${key})\n`, err);
    throw new Error(`Failed to download S3 object: ${key}`);
  }
};

const purgeBulkUploadS3Objects = async (establishmentId) => {
  // drop all in latest
  const listParams = {
    Bucket,
    Prefix: `${establishmentId}/latest/`,
  };

  const latestObjects = await s3.listObjects(listParams).promise();
  const deleteKeys = [];

  latestObjects.Contents.forEach((myFile) => {
    const ignoreRoot = /.*\/$/;
    if (!ignoreRoot.test(myFile.Key)) {
      deleteKeys.push({
        Key: myFile.Key,
      });
    }
  });

  listParams.Prefix = `${establishmentId}/intermediary/`;
  const intermediaryObjects = await s3.listObjects(listParams).promise();
  intermediaryObjects.Contents.forEach((myFile) => {
    deleteKeys.push({
      Key: myFile.Key,
    });
  });

  listParams.Prefix = `${establishmentId}/validation/`;
  const validationObjects = await s3.listObjects(listParams).promise();
  validationObjects.Contents.forEach((myFile) => {
    deleteKeys.push({
      Key: myFile.Key,
    });
  });

  if (deleteKeys.length > 0) {
    // now delete the objects in one go
    await s3
      .deleteObjects({
        Bucket,
        Delete: {
          Objects: deleteKeys,
          Quiet: true,
        },
      })
      .promise();
  }
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

// for the given user, restores all establishment and worker entities only from the DB, associating the workers
//  back to the establishment
const restoreOnloadEntities = async (loggedInUsername, primaryEstablishmentId, keepAlive = () => {}) => {
  try {
    // the result of validation is to make available an S3 object outlining ALL entities ready to be uploaded
    const allEntitiesKey = `${primaryEstablishmentId}/intermediary/all.entities.json`;

    const onLoadEntitiesJSON = await downloadContent(allEntitiesKey).then((myFile) => {
      keepAlive('restoreOnloadEntities');

      return myFile;
    });

    const onLoadEntities = JSON.parse(onLoadEntitiesJSON.data);

    // now create/load establishment entities from each of the establishments, including all associated entities (full depth including training/quals)
    const onLoadEstablishments = [];
    const onloadPromises = [];
    if (onLoadEntities && Array.isArray(onLoadEntities)) {
      onLoadEntities.forEach((thisEntity) => {
        const newOnloadEstablishment = new Establishment(loggedInUsername);
        onLoadEstablishments.push(newOnloadEstablishment);

        newOnloadEstablishment.initialise(
          thisEntity.address1,
          thisEntity.address2,
          thisEntity.address3,
          thisEntity.town,
          thisEntity.county,
          thisEntity.locationId,
          thisEntity.provId,
          thisEntity.postcode,
          thisEntity.isRegulated,
        );
        onloadPromises.push(
          newOnloadEstablishment.load(thisEntity, true).then((data) => {
            keepAlive('newOnloadEstablishment loaded');

            return data;
          }),
        );
      });
    }
    // wait here for the loading of all establishments from entities to complete
    await Promise.all(onloadPromises);

    return onLoadEstablishments;
  } catch (err) {
    console.error('/restoreExistingEntities: ERR: ', err.message);
    throw err;
  }
};

const completeNewEstablishment = async (
  thisNewEstablishment,
  theLoggedInUser,
  transaction,
  onloadEstablishments,
  primaryEstablishmentId,
  primaryEstablishmentUid,
  keepAlive = () => {},
) => {
  try {
    const startTime = new Date();

    // find the onload establishment by key
    const foundOnloadEstablishment = onloadEstablishments.find(
      (thisOnload) => thisOnload.key === thisNewEstablishment.key,
    );

    // the entity is already loaded, so simply prep it ready for saving
    if (foundOnloadEstablishment) {
      // as this new establishment is created from a parent, it automatically becomes a sub
      foundOnloadEstablishment.initialiseSub(primaryEstablishmentId, primaryEstablishmentUid);
      keepAlive('foundOnloadEstablishment initialised');
      await foundOnloadEstablishment.save(theLoggedInUser, true, transaction, true);
      keepAlive('foundOnloadEstablishment saved');
      await foundOnloadEstablishment.bulkUploadWdf(theLoggedInUser, transaction);
      keepAlive('foundOnloadEstablishment wdf calculated');
    }

    const endTime = new Date();
    const numberOfWorkers = foundOnloadEstablishment.workers.length;
    timerLog('CHECKPOINT - BU COMPLETE - new establishment', startTime, endTime, numberOfWorkers);
  } catch (err) {
    console.error('completeNewEstablishment: failed to complete upon new establishment: ', thisNewEstablishment.key);
    throw err;
  }
};

const completeUpdateEstablishment = async (
  thisUpdatedEstablishment,
  theLoggedInUser,
  transaction,
  onloadEstablishments,
  myCurrentEstablishments,
  keepAlive = () => {},
) => {
  try {
    const startTime = new Date();

    // find the current establishment and onload establishment by key
    const foundOnloadEstablishment = onloadEstablishments.find(
      (thisOnload) => thisOnload.key === thisUpdatedEstablishment.key,
    );
    const foundCurrentEstablishment = myCurrentEstablishments.find(
      (thisCurrent) => thisCurrent.key === thisUpdatedEstablishment.key,
    );

    // current is already restored, so simply need pass the onload entity into the current along with the associated set of worker entities
    if (foundCurrentEstablishment) {
      // when updating existing entities, need to remove the local identifer!
      // but because the properties are not actual properties - but managed properties - we can't just delete the property

      // simply work on the resulting full JSON presentation, whereby every property is a simply property
      const thisEstablishmentJSON = foundOnloadEstablishment.toJSON(false, false, false, false, true, null, true);
      delete thisEstablishmentJSON.localIdentifier;

      keepAlive('complete upload');
      await foundCurrentEstablishment.load(thisEstablishmentJSON, true, true);
      keepAlive('complete upload loaded');
      await foundCurrentEstablishment.save(theLoggedInUser, true, transaction, true);
      keepAlive('complete upload saved');
      await foundCurrentEstablishment.bulkUploadWdf(theLoggedInUser, transaction);
      keepAlive('complete upload wdf');

      const endTime = new Date();
      const numberOfWorkers = foundCurrentEstablishment.workers.length;
      timerLog('CHECKPOINT - BU COMPLETE - update establishment', startTime, endTime, numberOfWorkers);
    }
  } catch (err) {
    console.error(
      'completeUpdateEstablishment: failed to complete upon existing establishment: ',
      thisUpdatedEstablishment.key,
    );
    throw err;
  }
};

const completeDeleteEstablishment = async (
  thisDeletedEstablishment,
  theLoggedInUser,
  transaction,
  myCurrentEstablishments,
) => {
  try {
    const startTime = new Date();

    // find the current establishment by key
    const foundCurrentEstablishment = myCurrentEstablishments.find(
      (thisCurrent) => thisCurrent.key === thisDeletedEstablishment.key,
    );

    // current is already restored, so simply need to delete it
    if (foundCurrentEstablishment) {
      await foundCurrentEstablishment.delete(theLoggedInUser, transaction, true);
    }

    const endTime = new Date();
    const numberOfWorkers = foundCurrentEstablishment.workers.length;
    timerLog('CHECKPOINT - BU COMPLETE - delete establishment', startTime, endTime, numberOfWorkers);
  } catch (err) {
    console.error(
      'completeDeleteEstablishment: failed to complete upon deleting establishment: ',
      thisDeletedEstablishment.key,
    );
    throw err;
  }
};

const completePost = async (req, res) => {
  const keepAlive = (stepName = '', stepId = '') => {
    console.log(`Bulk Upload /complete keep alive: ${new Date()} ${stepName} ${stepId}`);
  };

  const theLoggedInUser = req.username;
  const primaryEstablishmentId = req.establishment.id;
  const primaryEstablishmentUid = req.establishment.uid;
  const isParent = req.isParent;

  try {
    // completing bulk upload must always work on the current set of known entities and not rely
    //  on any aspect of the current entities at the time of validation; there may be minutes/hours
    //  validating a bulk upload and completing it.
    const completeStartTime = new Date();
    // association level is just 1 (we need Establishment's workers for completion, but not the Worker's associated training and qualification)
    const myCurrentEstablishments = await restoreExistingEntities(
      theLoggedInUser,
      primaryEstablishmentId,
      isParent,
      1,
      keepAlive,
    );

    keepAlive('restore existing entities', primaryEstablishmentId);

    const restoredExistingStateTime = new Date();
    timerLog(
      'CHECKPOINT - BU COMPLETE - have restored current state of establishments/workers',
      completeStartTime,
      restoredExistingStateTime,
    );

    try {
      const onloadEstablishments = await restoreOnloadEntities(theLoggedInUser, primaryEstablishmentId, keepAlive);
      const validationDiferenceReportDownloaded = await downloadContent(
        `${primaryEstablishmentId}/validation/difference.report.json`,
        null,
        null,
      ).then((data) => {
        keepAlive('differences downloaded');

        return data;
      });
      const validationDiferenceReport = JSON.parse(validationDiferenceReportDownloaded.data);

      const restoredOnLoadStateTime = new Date();
      timerLog(
        'CHECKPOINT - BU COMPLETE - have restored onloaded state from validation stage',
        restoredExistingStateTime,
        restoredOnLoadStateTime,
      );

      // sequential promise console logger
      const log = (result) => result === null;

      // could look to parallel the three above tasks as each is relatively intensive - but happy path first
      // process the set of new, updated and deleted entities for bulk upload completion, within a single transaction
      let completeCommitTransactionTime = null;
      try {
        // all creates, updates and deletes (archive) are done in one transaction to ensure database integrity
        await dbModels.sequelize.transaction(async (t) => {
          // first create the new establishments - in sequence
          const starterNewPromise = Promise.resolve(null);
          await validationDiferenceReport.new.reduce(
            (p, thisNewEstablishment) =>
              p.then(() =>
                completeNewEstablishment(
                  thisNewEstablishment,
                  theLoggedInUser,
                  t,
                  onloadEstablishments,
                  primaryEstablishmentId,
                  primaryEstablishmentUid,
                  keepAlive,
                )
                  .then((data) => {
                    keepAlive('complete new establishment');

                    return data;
                  })
                  .then(log),
              ),
            starterNewPromise,
          );

          // now update the updated
          const starterUpdatedPromise = Promise.resolve(null);
          await validationDiferenceReport.updated.reduce(
            (p, thisUpdatedEstablishment) =>
              p.then(() =>
                completeUpdateEstablishment(
                  thisUpdatedEstablishment,
                  theLoggedInUser,
                  t,
                  onloadEstablishments,
                  myCurrentEstablishments,
                  keepAlive,
                )
                  .then((data) => {
                    keepAlive('completeUpdateEstablishment');

                    return data;
                  })
                  .then(log),
              ),
            starterUpdatedPromise,
          );

          // and finally, delete the deleted
          const starterDeletedPromise = Promise.resolve(null);
          await validationDiferenceReport.deleted.reduce(
            (p, thisDeletedEstablishment) =>
              p.then(() =>
                completeDeleteEstablishment(
                  thisDeletedEstablishment,
                  theLoggedInUser,
                  t,
                  myCurrentEstablishments,
                  keepAlive,
                )
                  .then((data) => {
                    keepAlive('completeDeleteEstablishment');

                    return data;
                  })
                  .then(log),
              ),
            starterDeletedPromise,
          );

          completeCommitTransactionTime = new Date();
        });

        const completeSaveTime = new Date();
        if (completeCommitTransactionTime) {
          timerLog('CHECKPOINT - BU COMPLETE - commit transaction', completeCommitTransactionTime, completeSaveTime);
        }
        timerLog(
          'CHECKPOINT - BU COMPLETE - have completed all establishments',
          restoredOnLoadStateTime,
          completeSaveTime,
        );

        // gets here having successfully completed upon the bulk upload
        //  clean up the S3 objects
        await purgeBulkUploadS3Objects(primaryEstablishmentId);

        keepAlive('purgeBulkUploadS3Objects');

        // confirm success against the primary establishment
        await Establishment.bulkUploadSuccess(primaryEstablishmentId);

        keepAlive('bulkUploadSuccess');

        const completeEndTime = new Date();
        timerLog('CHECKPOINT - BU COMPLETE - clean up', completeSaveTime, completeEndTime);
        timerLog('CHECKPOINT - BU COMPLETE - overall', completeStartTime, completeEndTime);

        await sendCountToSlack(theLoggedInUser, primaryEstablishmentId, validationDiferenceReport);

        await saveResponse(req, res, 200, {});
      } catch (err) {
        console.error("route('/complete') err: ", err);

        await saveResponse(req, res, 503, {
          message: 'Failed to save',
        });
      }
    } catch (err) {
      console.error(
        "router.route('/complete').post: failed to download entities intermediary - atypical that the object does not exist because not yet validated: ",
        err,
      );

      await saveResponse(req, res, 406, {
        message: 'Validation has not run',
      });
    }
  } catch (err) {
    console.error(err);

    await saveResponse(req, res, 503, {
      message: 'Service Unavailable',
    });
  }
};

const router = require('express').Router();

router.route('/complete').post(acquireLock.bind(null, completePost, buStates.COMPLETING));

module.exports = router;
