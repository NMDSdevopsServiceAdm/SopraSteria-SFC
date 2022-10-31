'use strict';
const models = require('../../../models');
const timerLog = require('../../../utils/timerLog');
const { sendCountToSlack } = require('./slack');
const { Establishment } = require('../../../models/classes/establishment');
const { buStates } = require('./states');
const { saveResponse, downloadContent, purgeBulkUploadS3Objects, saveLastBulkUpload } = require('./s3');
const { restoreExistingEntities, restoreOnloadEntities } = require('./entities');

const completeNewEstablishment = async (
  thisNewEstablishment,
  theLoggedInUser,
  transaction,
  onloadEstablishments,
  primaryEstablishmentId,
  primaryEstablishmentUid,
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
      await foundOnloadEstablishment.save(theLoggedInUser, true, transaction, true);
      await foundOnloadEstablishment.bulkUploadWdf(theLoggedInUser, transaction);
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

      await foundCurrentEstablishment.load(thisEstablishmentJSON, true, true);
      await foundCurrentEstablishment.save(theLoggedInUser, true, transaction, true);
      await foundCurrentEstablishment.bulkUploadWdf(theLoggedInUser, transaction);

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
  console.log('**** complete.js - completePost ****');
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
    const myCurrentEstablishments = await restoreExistingEntities(theLoggedInUser, primaryEstablishmentId, isParent, 1);

    const restoredExistingStateTime = new Date();
    timerLog(
      'CHECKPOINT - BU COMPLETE - have restored current state of establishments/workers',
      completeStartTime,
      restoredExistingStateTime,
    );

    try {
      const onloadEstablishments = await restoreOnloadEntities(theLoggedInUser, primaryEstablishmentId);
      const validationDifferenceReportDownloaded = await downloadContent(
        `${primaryEstablishmentId}/validation/difference.report.json`,
        null,
        null,
      ).then((data) => {
        return data;
      });
      const validationDifferenceReport = JSON.parse(validationDifferenceReportDownloaded.data);

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
        await models.sequelize.transaction(async (t) => {
          // first create the new establishments - in sequence
          const starterNewPromise = Promise.resolve(null);
          await validationDifferenceReport.new.reduce(
            (p, thisNewEstablishment) =>
              p.then(() =>
                completeNewEstablishment(
                  thisNewEstablishment,
                  theLoggedInUser,
                  t,
                  onloadEstablishments,
                  primaryEstablishmentId,
                  primaryEstablishmentUid,
                )
                  .then((data) => {
                    return data;
                  })
                  .then(log),
              ),
            starterNewPromise,
          );

          // now update the updated
          const starterUpdatedPromise = Promise.resolve(null);
          await validationDifferenceReport.updated.reduce(
            (p, thisUpdatedEstablishment) =>
              p.then(() =>
                completeUpdateEstablishment(
                  thisUpdatedEstablishment,
                  theLoggedInUser,
                  t,
                  onloadEstablishments,
                  myCurrentEstablishments,
                )
                  .then((data) => {
                    return data;
                  })
                  .then(log),
              ),
            starterUpdatedPromise,
          );

          // and finally, delete the deleted
          const starterDeletedPromise = Promise.resolve(null);
          await validationDifferenceReport.deleted.reduce(
            (p, thisDeletedEstablishment) =>
              p.then(() =>
                completeDeleteEstablishment(thisDeletedEstablishment, theLoggedInUser, t, myCurrentEstablishments)
                  .then((data) => {
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
        //  Saves the bulk upload files  to lastBulkUpload
        console.log('***** before saveLastBulkUpload *****');
        await saveLastBulkUpload(primaryEstablishmentId);
        console.log('***** after saveLastBulkUpload *****');
        // gets here having successfully completed upon the bulk upload
        //  clean up the S3 objects

        console.log('***** before purgeBulkUploadS3Objects *****');
        await purgeBulkUploadS3Objects(primaryEstablishmentId);
        console.log('***** after purgeBulkUploadS3Objects *****');
        // confirm success against the primary establishment
        console.log('***** before bulkUploadSuccess *****');
        await Establishment.bulkUploadSuccess(primaryEstablishmentId);
        console.log('***** after bulkUploadSuccess *****');
        const completeEndTime = new Date();
        timerLog('CHECKPOINT - BU COMPLETE - clean up', completeSaveTime, completeEndTime);
        timerLog('CHECKPOINT - BU COMPLETE - overall', completeStartTime, completeEndTime);

        await sendCountToSlack(theLoggedInUser, primaryEstablishmentId, validationDifferenceReport);

        await saveResponse(req, res, 200, {});
      } catch (err) {
        console.error("route('/complete') err: ", err);

        await saveResponse(req, res, 500, {
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

    await saveResponse(req, res, 500, {
      message: 'Service Unavailable',
    });
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/').post(acquireLock.bind(null, completePost, buStates.COMPLETING, true));

module.exports = router;
