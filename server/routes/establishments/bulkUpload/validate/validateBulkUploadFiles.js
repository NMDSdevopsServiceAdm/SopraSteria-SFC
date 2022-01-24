'use strict';

const moment = require('moment');

const { restoreExistingEntities } = require('../entities');
const {
  uploadUniqueLocalAuthoritiesToS3,
  uploadMetadataToS3,
  uploadDifferenceReportToS3,
  uploadValidationDataToS3,
  uploadEntitiesToS3,
} = require('../s3');
const { buStates } = require('../states');
const { processDifferenceReport } = require('./processDifferenceReport');

const EstablishmentCsvValidator = require('../../../../models/BulkImport/csv/establishments').Establishment;

const { validateEstablishmentCsv } = require('./validateEstablishmentCsv');
const { validateDuplicateLocations } = require('./validateDuplicateLocations');
const { validateWorkers } = require('./workers/validateWorkers');
const { validateTraining } = require('./training/validateTraining');
const { crossValidate } = require('../../../../models/BulkImport/csv/crossValidate');

const keepAlive = (stepName = '', stepId = '') => {
  console.log(`Bulk Upload /validate keep alive: ${new Date()} ${stepName} ${stepId}`);
};

// if commit is false, then the results of validation are not uploaded to S3
const validateBulkUploadFiles = async (req, files) => {
  const { username, establishmentId, isParent } = req;

  const establishments = files.Establishment;
  const workers = files.Worker;
  const training = files.Training;

  const csvEstablishmentSchemaErrors = [];

  const myEstablishments = [];

  // restore the current known state this primary establishment (including all subs)
  const RESTORE_ASSOCIATION_LEVEL = 1;

  keepAlive('begin validate files', establishmentId); // keep connection alive

  const myCurrentEstablishments = await restoreExistingEntities(
    username,
    establishmentId,
    isParent,
    RESTORE_ASSOCIATION_LEVEL,
    false,
    keepAlive,
  );

  // rather than an array of entities, entities will be known by their line number within the source, e.g:
  // establishments: {
  //    1: { },
  //    2: { },
  //    ...
  // }
  const myAPIEstablishments = {};

  // for unique/cross-reference validations
  const allEstablishmentsByKey = {};

  // /////////////////////////
  // Parse and process Establishments CSV
  if (
    Array.isArray(establishments.imported) &&
    establishments.imported.length > 0 &&
    establishments.metadata.fileType === 'Establishment'
  ) {
    // validate all establishment rows
    await Promise.all(
      establishments.imported.map((thisLine, currentLineNumber) =>
        validateEstablishmentCsv(
          thisLine,
          currentLineNumber + 2,
          csvEstablishmentSchemaErrors,
          myEstablishments,
          myAPIEstablishments,
          myCurrentEstablishments,
          keepAlive,
        ),
      ),
    );

    // having parsed all establishments, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'LOCALESTID` as property name
    myEstablishments.forEach((thisEstablishment) => {
      const keyNoWhitespace = thisEstablishment.localId.replace(/\s/g, '');
      if (allEstablishmentsByKey[keyNoWhitespace]) {
        // this establishment is a duplicate
        csvEstablishmentSchemaErrors.push(thisEstablishment.addDuplicate(allEstablishmentsByKey[keyNoWhitespace]));

        // remove the entity
        delete myAPIEstablishments[keyNoWhitespace];
      } else {
        // does not yet exist
        allEstablishmentsByKey[keyNoWhitespace] = thisEstablishment.lineNumber;
      }
    });

    await validateDuplicateLocations(myEstablishments, csvEstablishmentSchemaErrors, myCurrentEstablishments);
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no establishment records');
  }

  establishments.metadata.records = myEstablishments.length;

  // Parse and process Workers CSV
  const { csvWorkerSchemaErrors, myAPIWorkers, workersKeyed, allWorkersByKey, myJSONWorkers } = await validateWorkers(
    workers,
    myCurrentEstablishments,
    allEstablishmentsByKey,
    myAPIEstablishments,
  );

  // Parse and process Training CSV
  const { csvTrainingSchemaErrors, myTrainings, myAPITrainings } = await validateTraining(training);

  // note - there is no uniqueness test for a training record

  // Having parsed all establishments, workers and training, need to cross-check all training records' establishment reference
  // (LOCALESTID) against all parsed establishments
  // Having parsed all establishments, workers and training, need to cross-check all training records' worker reference
  // (UNIQUEWORKERID) against all parsed workers
  myTrainings.forEach((thisTraingRecord) => {
    const establishmentKeyNoWhitespace = (thisTraingRecord.localeStId || '').replace(/\s/g, '');
    const workerKeyNoWhitespace = (
      (thisTraingRecord.localeStId || '') + (thisTraingRecord.uniqueWorkerId || '')
    ).replace(/\s/g, '');

    if (!allEstablishmentsByKey[establishmentKeyNoWhitespace]) {
      // not found the associated establishment
      csvTrainingSchemaErrors.push(thisTraingRecord.uncheckedEstablishment());

      // remove the entity
      delete myAPITrainings[thisTraingRecord.lineNumber];
    } else if (!allWorkersByKey[workerKeyNoWhitespace]) {
      // not found the associated worker
      csvTrainingSchemaErrors.push(thisTraingRecord.uncheckedWorker());

      // remove the entity
      delete myAPITrainings[thisTraingRecord.lineNumber];
    } else {
      // gets here, all is good with the training record

      // find the associated Worker entity and forward reference this training record
      const foundWorkerByLineNumber = allWorkersByKey[workerKeyNoWhitespace];
      const knownWorker = foundWorkerByLineNumber ? myAPIWorkers[foundWorkerByLineNumber] : null;

      // training cross-validation against worker's date of birth (DOB) can only be applied, if:
      //  1. the associated Worker can be matched
      //  2. the worker has DOB defined (it's not a mandatory property)
      const trainingCompletedDate = moment.utc(thisTraingRecord._currentLine.DATECOMPLETED, 'DD-MM-YYYY');
      const foundAssociatedWorker = workersKeyed[workerKeyNoWhitespace];
      const workerDob =
        foundAssociatedWorker && foundAssociatedWorker.DOB
          ? moment.utc(workersKeyed[workerKeyNoWhitespace].DOB, 'DD-MM-YYYY')
          : null;

      if (workerDob && workerDob.isValid() && trainingCompletedDate.diff(workerDob, 'years') < 14) {
        csvTrainingSchemaErrors.push(thisTraingRecord.dobTrainingMismatch());
      }

      if (knownWorker) {
        knownWorker.associateTraining(myAPITrainings[thisTraingRecord.lineNumber]);
      } else {
        // this should never happen
        console.error(
          `FATAL: failed to associate worker (line number: ${thisTraingRecord.lineNumber}/unique id (${thisTraingRecord.uniqueWorker})) with a known establishment.`,
        );
      }
    }
  });

  training.metadata.records = myTrainings.length;

  // /////////////////////////
  // Cross Entity Validations

  // If the logged in account performing this validation is not a parent, then
  // there should be just one establishment, and that establishment should the primary establishment
  if (!isParent) {
    const MAX_ESTABLISHMENTS = 1;

    if (establishments.imported.length !== MAX_ESTABLISHMENTS) {
      csvEstablishmentSchemaErrors.unshift(EstablishmentCsvValidator.justOneEstablishmentError());
    }
  }

  // The primary establishment should always be present
  // TODO - should use LOCAL_IDENTIFIER when available.
  const primaryEstablishment = myCurrentEstablishments.find(
    (thisCurrentEstablishment) => thisCurrentEstablishment.id === establishmentId,
  );

  if (primaryEstablishment) {
    const onloadedPrimaryEstablishment = myAPIEstablishments[primaryEstablishment.key];

    if (!onloadedPrimaryEstablishment) {
      csvEstablishmentSchemaErrors.unshift(
        EstablishmentCsvValidator.missingPrimaryEstablishmentError(primaryEstablishment.name),
      );
    } else {
      // primary establishment does exist in given CSV; check STATUS is not DELETE - cannot delete the primary establishment
      if (onloadedPrimaryEstablishment.status === 'DELETE') {
        csvEstablishmentSchemaErrors.unshift(
          EstablishmentCsvValidator.cannotDeletePrimaryEstablishmentError(primaryEstablishment.name),
        );
      }
    }
  } else {
    console.error(
      'Seriously, if seeing this then something has truely gone wrong - the primary establishment should always be in the set of current establishments!',
    );
  }

  // Check for trying to upload against subsidaries for which this parent does not own (if a parent) - ignore the primary (self) establishment
  // must be a parent
  if (isParent) {
    Object.values(myAPIEstablishments).forEach((thisOnloadEstablishment) => {
      if (thisOnloadEstablishment.key !== primaryEstablishment.key) {
        // we're not the primary
        const foundCurrentEstablishment = myCurrentEstablishments.find(
          (thisCurrentEstablishment) => thisCurrentEstablishment.key === thisOnloadEstablishment.key,
        );

        if (foundCurrentEstablishment && foundCurrentEstablishment.dataOwner !== 'Parent') {
          const lineValidator = myEstablishments.find(
            (thisLineValidator) => thisLineValidator.key === foundCurrentEstablishment.key,
          );

          csvEstablishmentSchemaErrors.unshift(lineValidator.addNotOwner());
        }
      }
    });
  }

  // Run validations that require information about workers
  await Promise.all(
    myEstablishments.map(async (establishment) => {
      await establishment.crossValidate(csvEstablishmentSchemaErrors, myJSONWorkers);
    }),
  );

  // Run validations that require information about establishments
  await Promise.all(
    myJSONWorkers.map(async (worker) => {
      await crossValidate(csvWorkerSchemaErrors, myEstablishments, worker);
    }),
  );

  // /////////////////////////
  // Prepare validation results

  // prepare entities ready for upload/return
  const establishmentsAsArray = Object.values(myAPIEstablishments);

  // update CSV metadata error/warning counts
  establishments.metadata.errors = csvEstablishmentSchemaErrors.filter((thisError) => 'errCode' in thisError).length;
  establishments.metadata.warnings = csvEstablishmentSchemaErrors.filter((thisError) => 'warnCode' in thisError).length;

  workers.metadata.errors = csvWorkerSchemaErrors.filter((thisError) => 'errCode' in thisError).length;
  workers.metadata.warnings = csvWorkerSchemaErrors.filter((thisError) => 'warnCode' in thisError).length;

  training.metadata.errors = csvTrainingSchemaErrors.filter((thisError) => 'errCode' in thisError).length;
  training.metadata.warnings = csvTrainingSchemaErrors.filter((thisError) => 'warnCode' in thisError).length;

  // set the status based upon whether there were errors or warnings
  let status = buStates.FAILED;
  if (establishments.metadata.errors + workers.metadata.errors + training.metadata.errors === 0) {
    status =
      establishments.metadata.warnings + workers.metadata.warnings + training.metadata.warnings === 0
        ? buStates.PASSED
        : buStates.WARNINGS;
  }

  // create the difference report, which includes trapping for deleting of primary establishment
  const report = processDifferenceReport(establishmentId, establishmentsAsArray, myCurrentEstablishments);

  // from the validation report, get a summary of deleted establishments and workers
  // the report will always have new, udpated, deleted array values, even if empty
  // Note - Array.reduce but it doesn't work with empty arrays, except when you provide an initial value (0 in this case)
  establishments.metadata.deleted = report.deleted.length;
  const numberOfDeletedWorkersFromUpdatedEstablishments = report.updated.reduce(
    (total, current) => total + current.workers.deleted.length,
    0,
  );
  const numberOfDeletedWorkersFromDeletedEstablishments = report.deleted.reduce(
    (total, current) => total + current.workers.deleted.length,
    0,
  );
  workers.metadata.deleted =
    numberOfDeletedWorkersFromUpdatedEstablishments + numberOfDeletedWorkersFromDeletedEstablishments;

  const establishmentsToJSONWithAssociatedEntities = establishmentsAsArray.map((thisEstablishment) =>
    thisEstablishment.toJSON(false, false, false, false, true, null, true),
  );
  const uniqueLocalAuthorities = getUniqueLocalAuthorities(establishmentsAsArray);

  await Promise.all([
    uploadMetadataToS3(username, establishmentId, establishments, workers, training),
    uploadValidationDataToS3(
      username,
      establishmentId,
      csvEstablishmentSchemaErrors,
      csvWorkerSchemaErrors,
      csvTrainingSchemaErrors,
    ),
    uploadDifferenceReportToS3(username, establishmentId, report),
    uploadEntitiesToS3(username, establishmentId, establishmentsToJSONWithAssociatedEntities),
    uploadUniqueLocalAuthoritiesToS3(username, establishmentId, uniqueLocalAuthorities),
  ]);

  return {
    status,
    metaData: {
      establishments: establishments.metadata,
      workers: workers.metadata,
      training: training.metadata,
    },
  };
};

const getUniqueLocalAuthorities = (establishmentsAsArray) =>
  establishmentsAsArray
    .map((thisEstablishment) => thisEstablishment.toJSON())
    .map((en) => (en.localAuthorities !== undefined ? en.localAuthorities : []))
    .reduce((acc, val) => acc.concat(val), [])
    .map((la) => la.name)
    .sort((a, b) => a > b)
    .filter((value, index, self) => self.indexOf(value) === index);

module.exports = {
  validateBulkUploadFiles,
  keepAlive,
};
