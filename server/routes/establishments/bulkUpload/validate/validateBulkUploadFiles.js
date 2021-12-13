'use strict';

const config = require('../../../../config/config');
const moment = require('moment');

const { Establishment } = require('../../../../models/classes/establishment');
const { restoreExistingEntities } = require('../entities');
const { uploadAsJSON } = require('../s3');
const { buStates } = require('../states');
const { processDifferenceReport } = require('./processDifferenceReport');

const EstablishmentCsvValidator = require('../../../../models/BulkImport/csv/establishments').Establishment;

const { validateWorkerCsv } = require('./validateWorkerCsv');
const { validateEstablishmentCsv } = require('./validateEstablishmentCsv');
const { validateTrainingCsv } = require('./validateTrainingCsv');
const { validateDuplicateLocations } = require('./validateDuplicateLocations');
const { validateDuplicateWorkerID } = require('./validateDuplicateWorkerID');
const { validatePartTimeSalary } = require('./validatePartTimeSalary');

// if commit is false, then the results of validation are not uploaded to S3
const validateBulkUploadFiles = async (req, files, keepAlive = () => {}) => {
  const { username, establishmentId, isParent } = req;

  const establishments = files.Establishment;
  const workers = files.Worker;
  const training = files.Training;

  const csvEstablishmentSchemaErrors = [];
  const csvTrainingSchemaErrors = [];

  const myEstablishments = [];
  const myTrainings = [];

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
  const myAPITrainings = {};

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
  const { csvWorkerSchemaErrors, myWorkers, myAPIWorkers, workersKeyed, allWorkersByKey, myAPIQualifications } =
    await validateWorkers(workers, myCurrentEstablishments, keepAlive, allEstablishmentsByKey, myAPIEstablishments);

  // /////////////////////////
  // Parse and process Training CSV
  if (Array.isArray(training.imported) && training.imported.length > 0 && training.metadata.fileType === 'Training') {
    await Promise.all(
      training.imported.map(
        async (thisLine, currentLineNumber) =>
          await validateTrainingCsv(
            thisLine,
            currentLineNumber + 2,
            csvTrainingSchemaErrors,
            myTrainings,
            myAPITrainings,
          ),
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

  // upload intermediary/validation S3 objects
  const s3UploadPromises = [];

  // upload the metadata as JSON to S3 - these are requested for uploaded list endpoint
  if (establishments.imported) {
    s3UploadPromises.push(
      uploadAsJSON(
        username,
        establishmentId,
        establishments.metadata,
        `${establishmentId}/latest/${establishments.metadata.filename}.metadata.json`,
      ),
    );
  }

  if (workers.imported) {
    s3UploadPromises.push(
      uploadAsJSON(
        username,
        establishmentId,
        workers.metadata,
        `${establishmentId}/latest/${workers.metadata.filename}.metadata.json`,
      ),
    );
  }

  if (training.imported) {
    s3UploadPromises.push(
      uploadAsJSON(
        username,
        establishmentId,
        training.metadata,
        `${establishmentId}/latest/${training.metadata.filename}.metadata.json`,
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
          `${establishmentId}/intermediary/${establishments.metadata.filename}.csv.json`,
        ),
      );
    }

    if (myWorkers.length > 0) {
      s3UploadPromises.push(
        uploadAsJSON(
          username,
          establishmentId,
          myWorkers.map((thisEstablishment) => thisEstablishment.toJSON()),
          `${establishmentId}/intermediary/${workers.metadata.filename}.csv.json`,
        ),
      );
    }

    if (myTrainings.length > 0) {
      s3UploadPromises.push(
        uploadAsJSON(
          username,
          establishmentId,
          myTrainings.map((thisEstablishment) => thisEstablishment.toJSON()),
          `${establishmentId}/intermediary/${training.metadata.filename}.csv.json`,
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

  return {
    status,
    report,
    validation: {
      establishments: csvEstablishmentSchemaErrors,
      workers: csvWorkerSchemaErrors,
      training: csvTrainingSchemaErrors,
    },
    metaData: {
      establishments: establishments.metadata,
      workers: workers.metadata,
      training: training.metadata,
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

const validateWorkers = async (
  workers,
  myCurrentEstablishments,
  keepAlive,
  allEstablishmentsByKey,
  myAPIEstablishments,
) => {
  const csvWorkerSchemaErrors = [];
  const myWorkers = [];
  const myAPIWorkers = {};
  const workersKeyed = [];
  const allWorkersByKey = {};
  const myAPIQualifications = {};

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
  const allWorkerKeys = createKeysForWorkers(myWorkers);

  myWorkers.forEach((thisWorker) => {
    // check if hours matches others in the same job and same annual pay
    validatePartTimeSalary(thisWorker, myWorkers, myCurrentEstablishments, csvWorkerSchemaErrors);

    // uniqueness for a worker is across both the establishment and the worker
    const workerKey = createWorkerKey(thisWorker.local, thisWorker.uniqueWorker);
    const changeWorkerIdKey = thisWorker.changeUniqueWorker
      ? createWorkerKey(thisWorker.local, thisWorker.changeUniqueWorker)
      : null;

    if (
      validateDuplicateWorkerID(
        thisWorker,
        allWorkerKeys,
        changeWorkerIdKey,
        workerKey,
        allWorkersByKey,
        myAPIWorkers,
        csvWorkerSchemaErrors,
      )
    ) {
      // does not yet exist - check this worker can be associated with a known establishment
      const establishmentKeyNoWhitespace = thisWorker.local ? thisWorker.local.replace(/\s/g, '') : '';

      if (worksOverNationalInsuranceMaximum(thisWorker, myWorkers)) {
        csvWorkerSchemaErrors.push(thisWorker.exceedsNationalInsuranceMaximum());
      }

      if (!allEstablishmentsByKey[establishmentKeyNoWhitespace]) {
        // not found the associated establishment
        csvWorkerSchemaErrors.push(thisWorker.uncheckedEstablishment());

        // remove the entity
        delete myAPIWorkers[thisWorker.lineNumber];
      } else {
        // this worker is unique and can be associated to establishment
        allWorkersByKey[workerKey] = thisWorker.lineNumber;

        // to prevent subsequent Worker duplicates, add also the change worker id if CHGUNIQUEWORKERID is given
        if (changeWorkerIdKey) {
          allWorkersByKey[changeWorkerIdKey] = thisWorker.lineNumber;
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

  workers.metadata.records = myWorkers.length;

  return { csvWorkerSchemaErrors, myWorkers, myAPIWorkers, workersKeyed, allWorkersByKey, myAPIQualifications };
};

const createKeysForWorkers = (workers) => {
  return workers.map((worker) => {
    return createWorkerKey(worker.local, worker.uniqueWorker);
  });
};

const createWorkerKey = (localEstablishmentId, workerId) => {
  return (localEstablishmentId + workerId).replace(/\s/g, '');
};

const worksOverNationalInsuranceMaximum = (thisWorker, workers) => {
  const workerTotalHours = workers.reduce((sum, thatWorker) => {
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

  return workerTotalHours > 65;
};

module.exports = {
  validateBulkUploadFiles,
  createKeysForWorkers,
  createWorkerKey,
  worksOverNationalInsuranceMaximum,
};
