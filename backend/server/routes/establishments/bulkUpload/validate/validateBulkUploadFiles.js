'use strict';

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

const WorkplaceCsvValidator = require('../../../../models/BulkImport/csv/workplaceCSVValidator').WorkplaceCSVValidator;
const { validateWorkers } = require('./workers/validateWorkers');
const { validateWorkplace } = require('./workplace/validateWorkplace');
const { validateTraining } = require('./training/validateTraining');
const { crossValidate } = require('../../../../models/BulkImport/csv/crossValidate');

// if commit is false, then the results of validation are not uploaded to S3
const validateBulkUploadFiles = async (req, files) => {
  const { username, establishmentId, isParent } = req;

  const establishments = files.Establishment;
  const workers = files.Worker;
  const training = files.Training;

  // restore the current known state this primary establishment (including all subs)
  const RESTORE_ASSOCIATION_LEVEL = 1;

  const myCurrentEstablishments = await restoreExistingEntities(
    username,
    establishmentId,
    isParent,
    RESTORE_ASSOCIATION_LEVEL,
    false,
  );

  // Parse and process Establishments CSV
  const { csvEstablishmentSchemaErrors, myEstablishments, myAPIEstablishments, allEstablishmentsByKey } =
    await validateWorkplace(establishments, myCurrentEstablishments);

  // Parse and process Workers CSV
  const { csvWorkerSchemaErrors, myAPIWorkers, workersKeyed, allWorkersByKey, myJSONWorkers } = await validateWorkers(
    workers,
    myCurrentEstablishments,
    allEstablishmentsByKey,
    myAPIEstablishments,
  );

  // Parse and process Training CSV
  const { csvTrainingSchemaErrors } = await validateTraining(
    training,
    myAPIWorkers,
    workersKeyed,
    allWorkersByKey,
    allEstablishmentsByKey,
  );

  // Cross Entity Validations

  // If the logged in account performing this validation is not a parent, then
  // there should be just one establishment, and that establishment should the primary establishment
  if (!isParent) {
    const MAX_ESTABLISHMENTS = 1;

    if (establishments.imported.length !== MAX_ESTABLISHMENTS) {
      csvEstablishmentSchemaErrors.unshift(WorkplaceCsvValidator.justOneEstablishmentError());
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
        WorkplaceCsvValidator.missingPrimaryEstablishmentError(primaryEstablishment.name),
      );
    } else {
      // primary establishment does exist in given CSV; check STATUS is not DELETE - cannot delete the primary establishment
      if (onloadedPrimaryEstablishment.status === 'DELETE') {
        csvEstablishmentSchemaErrors.unshift(
          WorkplaceCsvValidator.cannotDeletePrimaryEstablishmentError(primaryEstablishment.name),
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
};
