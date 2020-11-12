'use strict';
const csv = require('csvtojson');
const config = require('../../../config/config');
const timerLog = require('../../../utils/timerLog');
const moment = require('moment');

const BUDI = require('../../../models/BulkImport/BUDI').BUDI;
const { MetaData } = require('../../../models/BulkImport/csv/metaData');

const EstablishmentCsvValidator = require('../../../models/BulkImport/csv/establishments').Establishment;
const WorkerCsvValidator = require('../../../models/BulkImport/csv/workers').Worker;
const TrainingCsvValidator = require('../../../models/BulkImport/csv/training').Training;

const postcodes = require('../../../models/postcodes');
const { Establishment } = require('../../../models/classes/establishment');
const { Worker } = require('../../../models/classes/worker');
const { Training } = require('../../../models/classes/training');
const { Qualification } = require('../../../models/classes/qualification');

const { s3, Bucket, saveResponse, uploadAsJSON, downloadContent } = require('./s3');
const { buStates } = require('./states');

const { restoreExistingEntities } = require('./entities');

const loadWorkerQualifications = async (
  lineValidator,
  thisQual,
  thisApiWorker,
  myAPIQualifications,
  keepAlive = () => {},
) => {
  const thisApiQualification = new Qualification();

  // load while ignoring the "column" attribute (being the CSV column index, e.g "03" from which the qualification is mapped)
  const isValid = await thisApiQualification.load(thisQual);

  keepAlive('qualification loaded', lineValidator.lineNumber);

  if (isValid) {
    // no validation errors in the entity itself, so add it ready for completion
    myAPIQualifications[lineValidator.lineNumber] = thisApiQualification;

    // associate the qualification entity to the Worker
    thisApiWorker.associateQualification(thisApiQualification);
  } else {
    const errors = thisApiQualification.errors;
    const warnings = thisApiQualification.warnings;

    lineValidator.addQualificationAPIValidation(thisQual.column, errors, warnings);

    if (errors.length === 0) {
      myAPIQualifications[lineValidator.lineNumber] = thisApiQualification;

      // associate the qualification entity to the Worker
      thisApiWorker.associateQualification(thisApiQualification);
    }
  }
};

const validateWorkerCsv = async (
  thisLine,
  currentLineNumber,
  csvWorkerSchemaErrors,
  myWorkers,
  myAPIWorkers,
  myAPIQualifications,
  myCurrentEstablishments,
  keepAlive = () => {},
) => {
  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  const lineValidator = new WorkerCsvValidator(thisLine, currentLineNumber, myCurrentEstablishments);

  lineValidator.validate();
  lineValidator.transform();

  const thisWorkerAsAPI = lineValidator.toAPI();

  try {
    const foundCurrentEstablishment = myCurrentEstablishments.find(
      (establishment) => establishment.key === lineValidator.establishmentKey,
    );
    const foundCurrentWorker = foundCurrentEstablishment.theWorker(lineValidator.key);

    if (thisWorkerAsAPI.postcode && foundCurrentWorker && foundCurrentWorker.postcode !== thisWorkerAsAPI.postcode) {
      const { Latitude, Longitude } = (await postcodes.firstOrCreate(thisWorkerAsAPI.postcode)) || {};

      thisWorkerAsAPI.Latitude = Latitude;
      thisWorkerAsAPI.Longitude = Longitude;
    }

    // construct Worker entity
    const thisApiWorker = new Worker();
    await thisApiWorker.load(thisWorkerAsAPI);

    keepAlive('worker loaded', currentLineNumber);

    if (thisApiWorker.validate()) {
      // no validation errors in the entity itself, so add it ready for completion
      myAPIWorkers[currentLineNumber] = thisApiWorker;

      // construct Qualification entities (can be multiple of a single Worker record) - regardless of whether the
      //  Worker is valid or not; we need to return as many errors/warnings in one go as possible
      await Promise.all(
        lineValidator
          .toQualificationAPI()
          .map((thisQual) =>
            loadWorkerQualifications(lineValidator, thisQual, thisApiWorker, myAPIQualifications, keepAlive),
          ),
      );
    } else {
      const errors = thisApiWorker.errors;

      if (errors.length === 0) {
        myAPIWorkers[currentLineNumber] = thisApiWorker;
      }
    }
  } catch (err) {
    console.error('WA - localised validate workers error until validation card', err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach((thisError) => csvWorkerSchemaErrors.push(thisError));
  }

  myWorkers.push(lineValidator);
};

const validateTrainingCsv = async (
  thisLine,
  currentLineNumber,
  csvTrainingSchemaErrors,
  myTrainings,
  myAPITrainings,
  keepAlive = () => {},
) => {
  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  const lineValidator = new TrainingCsvValidator(thisLine, currentLineNumber);

  lineValidator.validate();
  lineValidator.transform();

  const thisTrainingAsAPI = lineValidator.toAPI();
  try {
    const thisApiTraining = new Training();
    const isValid = await thisApiTraining.load(thisTrainingAsAPI);

    keepAlive('training loaded', currentLineNumber);

    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      myAPITrainings[currentLineNumber] = thisApiTraining;
    } else {
      const errors = thisApiTraining.errors;

      if (errors.length === 0) {
        myAPITrainings[currentLineNumber] = thisApiTraining;
      }
    }
  } catch (err) {
    console.error('WA - localised validate training error until validation card', err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach((thisError) => csvTrainingSchemaErrors.push(thisError));
  }

  myTrainings.push(lineValidator);
};

// having validated bulk upload files - and generated any number of validation errors and warnings
//  if there are no error, then the user will be able to complete the upload. But to be
//  able to complete on the upload though, they will need a report highlighting which, if any, of the
//  the establishments and workers will be deleted.
// Only generate this validation difference report, if there are no errors.
const validationDifferenceReport = (primaryEstablishmentId, onloadEntities, currentEntities) => {
  const newEntities = [];
  const updatedEntities = [];
  const deletedEntities = [];

  if (!onloadEntities || !Array.isArray(onloadEntities)) {
    console.error('validationDifferenceReport: onload entities unexpected');
  }
  if (!currentEntities || !Array.isArray(currentEntities)) {
    console.error('validationDifferenceReport: current entities unexpected');
  }

  // determine new and updated establishments, by referencing the onload set against the current set
  onloadEntities.forEach((thisOnloadEstablishment) => {
    // find a match for this establishment
    const foundCurrentEstablishment = currentEntities.find(
      (thisCurrentEstablishment) => thisCurrentEstablishment.key === thisOnloadEstablishment.key,
    );

    if (foundCurrentEstablishment) {
      // for updated establishments, need to cross check the set of onload and current workers to identify the new, updated and deleted workers
      const currentWorkers = foundCurrentEstablishment.associatedWorkers;
      const onloadWorkers = thisOnloadEstablishment.associatedWorkers;
      const newWorkers = [];
      const updatedWorkers = [];
      const deletedWorkers = [];

      // find new/updated/deleted workers
      onloadWorkers.forEach((thisOnloadWorker) => {
        const foundWorker = currentWorkers.find((thisCurrentWorker) => thisCurrentWorker === thisOnloadWorker);

        if (foundWorker) {
          const theWorker = foundCurrentEstablishment.theWorker(foundWorker);
          const theOnloadWorker = thisOnloadEstablishment.theWorker(thisOnloadWorker);

          // note - even though a worker has been found - and therefore it is obvious to update it
          // it may be marked for deletion
          if (theOnloadWorker.status === 'DELETE') {
            deletedWorkers.push({
              key: thisOnloadWorker,
              name: theWorker.nameOrId,
              localId: theWorker.localIdentifier,
              status: theOnloadWorker.status,
            });
          } else {
            updatedWorkers.push({
              key: thisOnloadWorker,
              name: theWorker.nameOrId,
              localId: theWorker.localIdentifier,
              status: theOnloadWorker.status,
            });
          }
        } else {
          const theWorker = thisOnloadEstablishment.theWorker(thisOnloadWorker);
          newWorkers.push({
            key: thisOnloadWorker,
            name: theWorker.nameOrId,
            localId: theWorker.localIdentifier,
            status: theWorker.status,
          });
        }
      });

      // find deleted workers
      currentWorkers.forEach((thisCurrentWorker) => {
        const foundWorker = onloadWorkers.find((thisOnloadWorker) => thisCurrentWorker === thisOnloadWorker);

        if (!foundWorker) {
          const theWorker = foundCurrentEstablishment.theWorker(thisCurrentWorker);
          deletedWorkers.push({
            key: thisCurrentWorker,
            name: theWorker.nameOrId,
            localId: theWorker.localIdentifier,
            status: 'DELETED', // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight this has been automatically detected
          });
        }
      });

      // even though the establishment has found, it is obvious that it will be updated. But it could
      //  instead be marked for deletion
      if (thisOnloadEstablishment.status === 'DELETE') {
        // now, when deleting an establishment, all the workers are also deleted, regardless of their declared status
        const revisedSetOfDeletedWorkers = [...newWorkers, ...updatedWorkers, ...deletedWorkers];
        deletedEntities.push({
          key: thisOnloadEstablishment.key,
          name: thisOnloadEstablishment.name,
          localId: thisOnloadEstablishment.localIdentifier,
          status: thisOnloadEstablishment.status,
          workers: {
            deleted: revisedSetOfDeletedWorkers,
          },
        });
      } else {
        updatedEntities.push({
          key: thisOnloadEstablishment.key,
          name: thisOnloadEstablishment.name,
          localId: thisOnloadEstablishment.localIdentifier,
          status: thisOnloadEstablishment.status,
          workers: {
            new: newWorkers,
            updated: updatedWorkers,
            deleted: deletedWorkers,
          },
        });
      }
    } else {
      newEntities.push({
        key: thisOnloadEstablishment.key,
        name: thisOnloadEstablishment.name,
        localId: thisOnloadEstablishment.localIdentifier,
        status: thisOnloadEstablishment.status,
      });
    }
  });

  // determine the delete establishments, by reference the current set against the onload set
  currentEntities.forEach((thisCurrentEstablishment) => {
    if (thisCurrentEstablishment.id !== primaryEstablishmentId) {
      // ignore those establishments that the primary does not own
      if (thisCurrentEstablishment.parentUid && thisCurrentEstablishment.dataOwner === 'Parent') {
        // find a match for this establishment
        const foundOnloadEstablishment = onloadEntities.find(
          (thisOnloadEstablishment) => thisCurrentEstablishment.key === thisOnloadEstablishment.key,
        );

        // cannot delete self
        if (!foundOnloadEstablishment) {
          // when delete an establishment, we're deleting all workers too
          const currentWorkers = thisCurrentEstablishment.associatedWorkers;
          const deletedWorkers = [];

          currentWorkers.forEach((thisCurrentWorker) => {
            const thisWorker = thisCurrentEstablishment.theWorker(thisCurrentWorker);
            deletedWorkers.push({
              key: thisCurrentWorker,
              name: thisWorker.nameOrId,
              localId: thisWorker.localIdentifier,
              status: 'DELETED', // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight
              // this has been automatically detected
            });
          });

          deletedEntities.push({
            key: thisCurrentEstablishment.key,
            name: thisCurrentEstablishment.name,
            localId: thisCurrentEstablishment.localIdentifier,
            status: 'DELETED', // NOTE - the expected value in the uploaded file is DELETE, but using DELETED here to highlight
            // this has been automatically detected
            workers: {
              deleted: deletedWorkers,
            },
          });
        }
      }
    } else {
      // TODO
      // need to raise a validation error as a result of trying to delete self
    }
  });

  // return validation difference report
  return {
    new: newEntities,
    updated: updatedEntities,
    deleted: deletedEntities,
  };
};

// if commit is false, then the results of validation are not uploaded to S3
const validateBulkUploadFiles = async (
  commit,
  username,
  establishmentId,
  isParent,
  establishments,
  workers,
  training,
  keepAlive = () => {},
) => {
  const csvEstablishmentSchemaErrors = [];
  const csvWorkerSchemaErrors = [];
  const csvTrainingSchemaErrors = [];

  const myEstablishments = [];
  const myWorkers = [];
  const myTrainings = [];
  const workersKeyed = [];

  const validateStartTime = new Date();

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

  const validateRestoredStateTime = new Date();

  timerLog('WA DEBUG - have restored existing state as reference', validateStartTime, validateRestoredStateTime);

  // rather than an array of entities, entities will be known by their line number within the source, e.g:
  // establishments: {
  //    1: { },
  //    2: { },
  //    ...
  // }
  const myAPIEstablishments = {};
  const myAPIWorkers = {};
  const myAPITrainings = {};
  const myAPIQualifications = {};

  // for unique/cross-reference validations
  const allEstablishmentsByKey = {};
  const allWorkersByKey = {};

  // /////////////////////////
  // Parse and process Establishments CSV
  if (
    Array.isArray(establishments.imported) &&
    establishments.imported.length > 0 &&
    establishments.establishmentMetadata.fileType === 'Establishment'
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

    await checkDuplicateLocations(myEstablishments, csvEstablishmentSchemaErrors, myCurrentEstablishments);
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no establishment records');
  }

  const validateEstablishmentsTime = new Date();
  timerLog(
    'CHECKPOINT - BU Validate - have validated establishments',
    validateRestoredStateTime,
    validateEstablishmentsTime,
  );

  establishments.establishmentMetadata.records = myEstablishments.length;

  // /////////////////////////
  // Parse and process Workers CSV
  if (Array.isArray(workers.imported) && workers.imported.length > 0 && workers.workerMetadata.fileType === 'Worker') {
    await Promise.all(
      workers.imported.map((thisLine, currentLineNumber) =>
        validateWorkerCsv(
          thisLine,
          currentLineNumber + 2,
          csvWorkerSchemaErrors,
          myWorkers,
          myAPIWorkers,
          myAPIQualifications,
          myCurrentEstablishments,
          keepAlive,
        ),
      ),
    );

    keepAlive('workers validated'); // keep connection alive

    // having parsed all workers, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'UNIQUEWORKERID`as property name
    const allKeys = [];
    myWorkers.map((worker) => {
      const id = (worker.local + worker.uniqueWorker).replace(/\s/g, '');
      allKeys.push(id);
    });

    myWorkers.forEach((thisWorker) => {
      // check if hours matches others in the same job and same annual pay
      checkPartTimeSalary(thisWorker, myWorkers, myCurrentEstablishments, csvWorkerSchemaErrors);

      // uniquness for a worker is across both the establishment and the worker
      const keyNoWhitespace = (thisWorker.local + thisWorker.uniqueWorker).replace(/\s/g, '');
      const changeKeyNoWhitespace = thisWorker.changeUniqueWorker
        ? (thisWorker.local + thisWorker.changeUniqueWorker).replace(/\s/g, '')
        : null;

      if (
        checkDuplicateWorkerID(
          thisWorker,
          allKeys,
          changeKeyNoWhitespace,
          keyNoWhitespace,
          allWorkersByKey,
          myAPIWorkers,
          csvWorkerSchemaErrors,
        )
      ) {
        // does not yet exist - check this worker can be associated with a known establishment
        const establishmentKeyNoWhitespace = thisWorker.local ? thisWorker.local.replace(/\s/g, '') : '';

        const myWorkersTotalHours = myWorkers.reduce((sum, thatWorker) => {
          if (thisWorker.nationalInsuranceNumber === thatWorker.nationalInsuranceNumber) {
            if (thatWorker.weeklyContractedHours) {
              return sum + thatWorker.weeklyContractedHours;
            }
            if (thatWorker.weeklyAverageHours) {
              return sum + thatWorker.weeklyAverageHours;
            }
          }
          return sum;
        }, 0);

        if (myWorkersTotalHours > 65) {
          csvWorkerSchemaErrors.push(thisWorker.exceedsNationalInsuranceMaximum());
        }

        if (!allEstablishmentsByKey[establishmentKeyNoWhitespace]) {
          // not found the associated establishment
          csvWorkerSchemaErrors.push(thisWorker.uncheckedEstablishment());

          // remove the entity
          delete myAPIWorkers[thisWorker.lineNumber];
        } else {
          // this worker is unique and can be associated to establishment
          allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;

          // to prevent subsequent Worker duplicates, add also the change worker id if CHGUNIQUEWORKERID is given
          if (changeKeyNoWhitespace) {
            allWorkersByKey[changeKeyNoWhitespace] = thisWorker.lineNumber;
          }

          // associate this worker to the known establishment
          const knownEstablishment = myAPIEstablishments[establishmentKeyNoWhitespace]
            ? myAPIEstablishments[establishmentKeyNoWhitespace]
            : null;

          // key workers, to be used in training
          const workerKeyNoWhitespace = (
            thisWorker._currentLine.LOCALESTID + thisWorker._currentLine.UNIQUEWORKERID
          ).replace(/\s/g, '');
          workersKeyed[workerKeyNoWhitespace] = thisWorker._currentLine;

          if (knownEstablishment && myAPIWorkers[thisWorker.lineNumber]) {
            knownEstablishment.associateWorker(
              myAPIWorkers[thisWorker.lineNumber].key,
              myAPIWorkers[thisWorker.lineNumber],
            );
          } else {
            // this should never happen
            console.error(
              `FATAL: failed to associate worker (line number: ${thisWorker.lineNumber}/unique id (${thisWorker.uniqueWorker})) with a known establishment.`,
            );
          }
        }
      }
    });
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no workers records');
  }
  workers.workerMetadata.records = myWorkers.length;

  const validateWorkersTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have validated workers', validateEstablishmentsTime, validateWorkersTime);

  // /////////////////////////
  // Parse and process Training CSV
  if (
    Array.isArray(training.imported) &&
    training.imported.length > 0 &&
    training.trainingMetadata.fileType === 'Training'
  ) {
    await Promise.all(
      training.imported.map((thisLine, currentLineNumber) =>
        validateTrainingCsv(thisLine, currentLineNumber + 2, csvTrainingSchemaErrors, myTrainings, myAPITrainings),
      ),
    );

    keepAlive('trainings processed');

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
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no training records');
  }

  training.trainingMetadata.records = myTrainings.length;

  const validateTrainingTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have validated training', validateWorkersTime, validateTrainingTime);

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
      await establishment.crossValidate({
        csvEstablishmentSchemaErrors,
        myWorkers,
        fetchMyEstablishmentsWorkers: Establishment.fetchMyEstablishmentsWorkers,
      });
    }),
  );

  // Run validations that require information about establishments
  await Promise.all(
    myWorkers.map(async (worker) => {
      await worker.crossValidate({
        csvWorkerSchemaErrors,
        myEstablishments,
      });
    }),
  );

  // /////////////////////////
  // Prepare validation results

  // prepare entities ready for upload/return
  const establishmentsAsArray = Object.values(myAPIEstablishments);
  const workersAsArray = Object.values(myAPIWorkers);
  const trainingAsArray = Object.values(myAPITrainings);
  const qualificationsAsArray = Object.values(myAPIQualifications);

  // update CSV metadata error/warning counts
  establishments.establishmentMetadata.errors = csvEstablishmentSchemaErrors.filter(
    (thisError) => 'errCode' in thisError,
  ).length;
  establishments.establishmentMetadata.warnings = csvEstablishmentSchemaErrors.filter(
    (thisError) => 'warnCode' in thisError,
  ).length;

  workers.workerMetadata.errors = csvWorkerSchemaErrors.filter((thisError) => 'errCode' in thisError).length;
  workers.workerMetadata.warnings = csvWorkerSchemaErrors.filter((thisError) => 'warnCode' in thisError).length;

  training.trainingMetadata.errors = csvTrainingSchemaErrors.filter((thisError) => 'errCode' in thisError).length;
  training.trainingMetadata.warnings = csvTrainingSchemaErrors.filter((thisError) => 'warnCode' in thisError).length;

  // set the status based upon whether there were errors or warnings
  let status = buStates.FAILED;
  if (
    establishments.establishmentMetadata.errors + workers.workerMetadata.errors + training.trainingMetadata.errors ===
    0
  ) {
    status =
      establishments.establishmentMetadata.warnings +
        workers.workerMetadata.warnings +
        training.trainingMetadata.warnings ===
      0
        ? buStates.PASSED
        : buStates.WARNINGS;
  }

  const validateCompleteTime = new Date();
  timerLog('CHECKPOINT - BU Validate - have cross-checked validations', validateTrainingTime, validateCompleteTime);
  timerLog('CHECKPOINT - BU Validate - overall validations', validateRestoredStateTime, validateCompleteTime);

  // create the difference report, which includes trapping for deleting of primary establishment
  const report = validationDifferenceReport(establishmentId, establishmentsAsArray, myCurrentEstablishments);

  const validateDifferenceReportTime = new Date();
  timerLog('CHECKPOINT - BU Validate - diference report', validateCompleteTime, validateDifferenceReportTime);
  timerLog(
    'CHECKPOINT - BU Validate - overall validations including restoring state and difference report',
    validateStartTime,
    validateDifferenceReportTime,
  );

  // from the validation report, get a summary of deleted establishments and workers
  // the report will always have new, udpated, deleted array values, even if empty
  // Note - Array.reduce but it doesn't work with empty arrays, except when you provide an initial value (0 in this case)
  establishments.establishmentMetadata.deleted = report.deleted.length;
  const numberOfDeletedWorkersFromUpdatedEstablishments = report.updated.reduce(
    (total, current) => total + current.workers.deleted.length,
    0,
  );
  const numberOfDeletedWorkersFromDeletedEstablishments = report.deleted.reduce(
    (total, current) => total + current.workers.deleted.length,
    0,
  );
  workers.workerMetadata.deleted =
    numberOfDeletedWorkersFromUpdatedEstablishments + numberOfDeletedWorkersFromDeletedEstablishments;

  // upload intermediary/validation S3 objects
  if (commit) {
    const s3UploadPromises = [];

    // upload the metadata as JSON to S3 - these are requested for uploaded list endpoint
    if (establishments.imported) {
      s3UploadPromises.push(
        uploadAsJSON(
          username,
          establishmentId,
          establishments.establishmentMetadata,
          `${establishmentId}/latest/${establishments.establishmentMetadata.filename}.metadata.json`,
        ),
      );
    }

    if (workers.imported) {
      s3UploadPromises.push(
        uploadAsJSON(
          username,
          establishmentId,
          workers.workerMetadata,
          `${establishmentId}/latest/${workers.workerMetadata.filename}.metadata.json`,
        ),
      );
    }

    if (training.imported) {
      s3UploadPromises.push(
        uploadAsJSON(
          username,
          establishmentId,
          training.trainingMetadata,
          `${establishmentId}/latest/${training.trainingMetadata.filename}.metadata.json`,
        ),
      );
    }

    // upload the validation data to S3 - these are reuquired for validation report -
    // although one object is likely to be quicker to upload - and only one object is required then to download
    s3UploadPromises.push(
      uploadAsJSON(
        username,
        establishmentId,
        csvEstablishmentSchemaErrors,
        `${establishmentId}/validation/establishments.validation.json`,
      ),
    );

    s3UploadPromises.push(
      uploadAsJSON(
        username,
        establishmentId,
        csvWorkerSchemaErrors,
        `${establishmentId}/validation/workers.validation.json`,
      ),
    );

    s3UploadPromises.push(
      uploadAsJSON(
        username,
        establishmentId,
        csvTrainingSchemaErrors,
        `${establishmentId}/validation/training.validation.json`,
      ),
    );

    s3UploadPromises.push(
      uploadAsJSON(username, establishmentId, report, `${establishmentId}/validation/difference.report.json`),
    );

    // to false to disable the upload of intermediary objects
    // the all entities intermediary file is required on completion - establishments entity for validation report
    if (establishmentsAsArray.length > 0) {
      s3UploadPromises.push(
        uploadAsJSON(
          username,
          establishmentId,
          establishmentsAsArray.map((thisEstablishment) =>
            thisEstablishment.toJSON(false, false, false, false, true, null, true),
          ),
          `${establishmentId}/intermediary/all.entities.json`,
        ),
      );
    }

    // for the purpose of the establishment validation report, need a list of all unique local authorities against all establishments
    const establishmentsOnlyForJson = establishmentsAsArray.map((thisEstablishment) => thisEstablishment.toJSON());
    const uniqueLocalAuthorities = establishmentsOnlyForJson
      .map((en) => (en.localAuthorities !== undefined ? en.localAuthorities : []))
      .reduce((acc, val) => acc.concat(val), [])
      .map((la) => la.name)
      .sort((a, b) => a > b)
      .filter((value, index, self) => self.indexOf(value) === index);

    s3UploadPromises.push(
      uploadAsJSON(
        username,
        establishmentId,
        uniqueLocalAuthorities,
        `${establishmentId}/intermediary/all.localauthorities.json`,
      ),
    );

    if (config.get('bulkupload.validation.storeIntermediaries')) {
      // upload the converted CSV as JSON to S3 - these are temporary objects as we build confidence in bulk upload they can be removed
      if (myEstablishments.length > 0) {
        s3UploadPromises.push(
          uploadAsJSON(
            username,
            establishmentId,
            myEstablishments.map((thisEstablishment) => thisEstablishment.toJSON()),
            `${establishmentId}/intermediary/${establishments.establishmentMetadata.filename}.csv.json`,
          ),
        );
      }

      if (myWorkers.length > 0) {
        s3UploadPromises.push(
          uploadAsJSON(
            username,
            establishmentId,
            myWorkers.map((thisEstablishment) => thisEstablishment.toJSON()),
            `${establishmentId}/intermediary/${workers.workerMetadata.filename}.csv.json`,
          ),
        );
      }

      if (myTrainings.length > 0) {
        s3UploadPromises.push(
          uploadAsJSON(
            username,
            establishmentId,
            myTrainings.map((thisEstablishment) => thisEstablishment.toJSON()),
            `${establishmentId}/intermediary/${training.trainingMetadata.filename}.csv.json`,
          ),
        );
      }

      // upload the intermediary entities as JSON to S3
      if (establishmentsAsArray.length > 0) {
        s3UploadPromises.push(
          uploadAsJSON(
            username,
            establishmentId,
            establishmentsOnlyForJson,
            `${establishmentId}/intermediary/establishment.entities.json`,
          ),
        );
      }

      if (workersAsArray.length > 0) {
        s3UploadPromises.push(
          uploadAsJSON(
            username,
            establishmentId,
            workersAsArray.map((thisWorker) => thisWorker.toJSON()),
            `${establishmentId}/intermediary/worker.entities.json`,
          ),
        );
      }

      if (trainingAsArray.length > 0) {
        s3UploadPromises.push(
          uploadAsJSON(
            username,
            establishmentId,
            trainingAsArray.map((thisTraining) => thisTraining.toJSON()),
            `${establishmentId}/intermediary/training.entities.json`,
          ),
        );
      }

      if (qualificationsAsArray.length > 0) {
        s3UploadPromises.push(
          uploadAsJSON(
            username,
            establishmentId,
            qualificationsAsArray.map((thisQualification) => thisQualification.toJSON()),
            `${establishmentId}/intermediary/qualification.entities.json`,
          ),
        );
      }
    }

    // before returning, wait for all uploads to complete
    await Promise.all(s3UploadPromises);
  }

  const validateS3UploadTime = new Date();
  timerLog('CHECKPOINT - BU Validate - upload artifacts to S3', validateDifferenceReportTime, validateS3UploadTime);

  timerLog('CHECKPOINT - BU Validate - total', validateStartTime, validateS3UploadTime);

  return {
    status,
    report,
    validation: {
      establishments: csvEstablishmentSchemaErrors,
      workers: csvWorkerSchemaErrors,
      training: csvTrainingSchemaErrors,
    },
    metaData: {
      establishments: establishments.establishmentMetadata,
      workers: workers.workerMetadata,
      training: training.trainingMetadata,
    },
    data: {
      csv: {
        establishments: myEstablishments.map((thisEstablishment) => thisEstablishment.toJSON()),
        workers: myWorkers.map((thisWorker) => thisWorker.toJSON()),
        training: myTrainings.map((thisTraining) => thisTraining.toJSON()),
      },
      entities: {
        establishments: establishmentsAsArray.map((thisEstablishment) => thisEstablishment.toJSON()),
        workers: workersAsArray.map((thisWorker) => thisWorker.toJSON()),
        training: trainingAsArray.map((thisTraining) => thisTraining.toJSON()),
        qualifications: qualificationsAsArray.map((thisQualification) => thisQualification.toJSON()),
      },
      resulting: establishmentsAsArray.map((thisEstablishment) =>
        thisEstablishment.toJSON(false, false, false, false, true, null, true),
      ),
    },
  };
};

const validateEstablishmentCsv = async (
  thisLine,
  currentLineNumber,
  csvEstablishmentSchemaErrors,
  myEstablishments,
  myAPIEstablishments,
  myCurrentEstablishments,
  keepAlive = () => {},
) => {
  const lineValidator = new EstablishmentCsvValidator(thisLine, currentLineNumber, myCurrentEstablishments);

  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  await lineValidator.validate();
  if (!lineValidator._ignore) {
    lineValidator.transform();

    const thisEstablishmentAsAPI = lineValidator.toAPI();

    try {
      const thisApiEstablishment = new Establishment();
      thisApiEstablishment.initialise(
        thisEstablishmentAsAPI.Address1,
        thisEstablishmentAsAPI.Address2,
        thisEstablishmentAsAPI.Address3,
        thisEstablishmentAsAPI.Town,
        null,
        thisEstablishmentAsAPI.LocationId,
        thisEstablishmentAsAPI.ProvId,
        thisEstablishmentAsAPI.Postcode,
        thisEstablishmentAsAPI.IsCQCRegulated,
      );

      const foundCurrentEstablishment = myCurrentEstablishments.find(
        (thisCurrentEstablishment) => thisCurrentEstablishment.key === lineValidator.key,
      );

      if (
        thisApiEstablishment.postcode &&
        foundCurrentEstablishment &&
        foundCurrentEstablishment.postcode !== thisApiEstablishment.postcode
      ) {
        const { Latitude, Longitude } = (await postcodes.firstOrCreate(thisApiEstablishment.postcode)) || {};

        thisEstablishmentAsAPI.Latitude = Latitude;
        thisEstablishmentAsAPI.Longitude = Longitude;
      }

      await thisApiEstablishment.load(thisEstablishmentAsAPI);

      keepAlive('establishment loaded', currentLineNumber);

      if (thisApiEstablishment.validate()) {
        // No validation errors in the entity itself, so add it ready for completion
        myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
      } else {
        const errors = thisApiEstablishment.errors;

        if (errors.length === 0) {
          myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
        } else {
          // TODO: Remove this when capacities and services are fixed; temporarily adding establishments
          // even though they're in error (because service/capacity validations put all in error)
          myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
        }
      }
    } catch (err) {
      console.error('WA - localised validate establishment error until validation card', err);
    }
  } else {
    console.log('Ignoring', lineValidator._name);
  }
  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach((thisError) => csvEstablishmentSchemaErrors.push(thisError));
  }
  if (!lineValidator._ignore) {
    myEstablishments.push(lineValidator);
  }
};

const checkDuplicateLocations = async (myEstablishments, csvEstablishmentSchemaErrors, myCurrentEstablishments) => {
  const locations = [];
  const checkDuplicate = (thisEstablishment, locationId) => {
    if (locations[locationId] !== undefined) {
      csvEstablishmentSchemaErrors.push(thisEstablishment.getDuplicateLocationError());
      return;
    }

    locations[locationId] = thisEstablishment.lineNumber;
  };

  const filterByStatus = (thisEstablishment, statuses) => {
    return statuses.includes(thisEstablishment._currentLine.STATUS);
  };

  myEstablishments
    .filter((thisEstablishment) => filterByStatus(thisEstablishment, ['NOCHANGE']))
    .forEach((thisEstablishment) => {
      myCurrentEstablishments
        .filter(
          (establishment) =>
            establishment.localIdentifier &&
            establishment.localIdentifier === thisEstablishment._currentLine.LOCALESTID,
        )
        .forEach((establishment) => {
          return checkDuplicate(thisEstablishment, establishment.locationId);
        });
    });

  myEstablishments
    .filter((thisEstablishment) => thisEstablishment._currentLine.LOCATIONID)
    .filter((thisEstablishment) => filterByStatus(thisEstablishment, ['NEW', 'UPDATE', 'CHGSUB']))
    .forEach((thisEstablishment) => {
      return checkDuplicate(thisEstablishment, thisEstablishment._currentLine.LOCATIONID);
    });
};

const checkDuplicateWorkerID = (
  thisWorker,
  allKeys,
  changeKeyNoWhitespace,
  keyNoWhitespace,
  allWorkersByKey,
  myAPIWorkers,
  csvWorkerSchemaErrors,
) => {
  // the worker will be known by LOCALSTID and UNIQUEWORKERID, but if CHGUNIQUEWORKERID is given, then it's combination of LOCALESTID and CHGUNIQUEWORKERID must be unique
  if (changeKeyNoWhitespace && (allWorkersByKey[changeKeyNoWhitespace] || allKeys.includes(changeKeyNoWhitespace))) {
    // this worker is a duplicate
    csvWorkerSchemaErrors.push(thisWorker.addChgDuplicate(thisWorker.changeUniqueWorker));

    // remove the entity
    delete myAPIWorkers[thisWorker.lineNumber];
    return false;
  } else if (allWorkersByKey[keyNoWhitespace] !== undefined) {
    // this worker is a duplicate
    csvWorkerSchemaErrors.push(thisWorker.addDuplicate(thisWorker.uniqueWorker));

    // remove the entity
    delete myAPIWorkers[thisWorker.lineNumber];
    return false;
  } else {
    return true;
  }
};

// check if hours matches others in the same job and same annual pay
const checkPartTimeSalary = (thisWorker, myWorkers, myCurrentEstablishments, csvWorkerSchemaErrors) => {
  if (thisWorker._currentLine.STATUS === 'UNCHECKED' || thisWorker._currentLine.STATUS === 'DELETE') {
    return;
  }
  if (
    thisWorker._currentLine.CONTHOURS !== '' &&
    parseFloat(thisWorker._currentLine.CONTHOURS) < 37 &&
    thisWorker._currentLine.SALARY !== '' &&
    thisWorker._currentLine.SALARYINT === '1'
  ) {
    let workersToCheckinDB = [];
    let otherWorkerFTE = myWorkers.some(function (worker) {
      if (
        worker._currentLine.STATUS !== 'DELETE' &&
        worker._currentLine.STATUS !== 'UNCHECKED' &&
        worker._currentLine.STATUS !== 'NOCHANGE' &&
        worker._currentLine.SALARYINT === '1' &&
        worker._currentLine.SALARY === thisWorker._currentLine.SALARY &&
        worker._currentLine.MAINJOBROLE === thisWorker._currentLine.MAINJOBROLE &&
        parseFloat(worker._currentLine.CONTHOURS) > 36
      ) {
        return true;
      } else if (worker._currentLine.STATUS === 'UNCHECKED' || worker._currentLine.STATUS === 'NOCHANGE') {
        workersToCheckinDB.push(worker._currentLine.UNIQUEWORKERID);
      }
    });

    if (otherWorkerFTE) {
      csvWorkerSchemaErrors.push(thisWorker.ftePayCheckHasDifferentHours());
    } else if (workersToCheckinDB.length) {
      if (
        myCurrentEstablishments.some(function (establishment) {
          return workersToCheckinDB.some(function (localID) {
            localID = localID.replace(/\s/g, '');
            if (establishment._workerEntities[localID]) {
              const worker = establishment._workerEntities[localID];
              if (
                worker.annualHourlyPay &&
                worker.annualHourlyPay.value === 'Annually' &&
                worker.annualHourlyPay.rate == thisWorker._currentLine.SALARY &&
                worker.mainJob
              ) {
                const mappedRole = BUDI.jobRoles(BUDI.TO_ASC, parseInt(thisWorker._currentLine.MAINJOBROLE));
                if (
                  worker.mainJob.jobId == mappedRole &&
                  worker.contractedHours &&
                  parseFloat(worker.contractedHours.hours) > 36
                ) {
                  return true;
                }
              }
            }
          });
        })
      ) {
        csvWorkerSchemaErrors.push(thisWorker.ftePayCheckHasDifferentHours());
      }
    }
  }
};

const validatePut = async (req, res) => {
  const keepAlive = (stepName = '', stepId = '') => {
    console.log(`Bulk Upload /validate keep alive: ${new Date()} ${stepName} ${stepId}`);
  };

  const establishments = {
    imported: null,
    establishmentMetadata: new MetaData(),
  };

  const workers = {
    imported: null,
    workerMetadata: new MetaData(),
  };

  const trainings = {
    imported: null,
    trainingMetadata: new MetaData(),
  };

  let estNotFound = true;
  let wrkNotFound = true;
  let trnNotFound = true;
  const establishmentId = req.establishmentId;

  try {
    const validationResponse =
      // get list of files from s3 bucket
      await s3
        .listObjects({
          Bucket,
          Prefix: `${establishmentId}/latest/`,
        })
        .promise()

        // download the contents of the appropriate ones we find
        .then((data) =>
          Promise.all(
            data.Contents.reduce((arr, myFileStats) => {
              keepAlive('bucket listed'); // keep connection alive

              if (!(/.*metadata.json$/.test(myFileStats.Key) || /.*\/$/.test(myFileStats.Key))) {
                arr.push(
                  downloadContent(myFileStats.Key)
                    // for each downloaded file, test its type then update the closure variables
                    .then((myFile) => {
                      keepAlive('file downloaded', `${myFileStats.Key}`); // keep connection alive

                      let obj = null;
                      let metadata = null;

                      // figure out which type of csv this file is and load the data
                      if (estNotFound && EstablishmentCsvValidator.isContent(myFile.data)) {
                        estNotFound = false;
                        obj = establishments;
                        metadata = establishments.establishmentMetadata;

                        metadata.filename = myFile.filename;
                        metadata.fileType = 'Establishment';
                        metadata.userName = myFile.username;
                      } else if (wrkNotFound && WorkerCsvValidator.isContent(myFile.data)) {
                        wrkNotFound = false;
                        obj = workers;
                        metadata = workers.workerMetadata;

                        metadata.filename = myFile.filename;
                        metadata.fileType = 'Worker';
                        metadata.userName = myFile.username;
                      } else if (trnNotFound && TrainingCsvValidator.isContent(myFile.data)) {
                        trnNotFound = false;
                        obj = trainings;
                        metadata = trainings.trainingMetadata;

                        metadata.filename = myFile.filename;
                        metadata.fileType = 'Training';
                        metadata.userName = myFile.username;
                      }

                      // if not one of our expected types then just return
                      if (obj === null) {
                        return true;
                      }
                      // parse the file contents as csv then return the data
                      return csv()
                        .fromString(myFile.data)
                        .then((imported) => {
                          keepAlive('csv parsed', myFileStats.Key); // keep connection alive

                          obj.imported = imported;

                          return true;
                        });
                    }),
                );
              }

              return arr;
            }, []),
          ),
        )

        // validate the csv files we found
        .then(() =>
          validateBulkUploadFiles(
            true,
            req.username,
            establishmentId,
            req.isParent,
            establishments,
            workers,
            trainings,
            keepAlive,
          ),
        );

    // set what the next state should be
    res.buValidationResult = validationResponse.status;

    // handle parsing errors
    await saveResponse(req, res, 200, {
      establishment: validationResponse.metaData.establishments.toJSON(),
      workers: validationResponse.metaData.workers.toJSON(),
      training: validationResponse.metaData.training.toJSON(),
    });
  } catch (err) {
    console.error(err);

    await saveResponse(req, res, 503, {});
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/').put(acquireLock.bind(null, validatePut, buStates.VALIDATING));

module.exports = router;
module.exports.validateEstablishmentCsv = validateEstablishmentCsv;
