const moment = require('moment');

const { validateTrainingCsv } = require('./validateTrainingCsv');
const { establishmentNotFoundInFile, addNoEstablishmentError } = require('../shared/uncheckedEstablishment');

exports.validateTraining = async (training, myAPIWorkers, workersKeyed, allWorkersByKey, allEstablishmentsByKey) => {
  const { csvTrainingSchemaErrors, myTrainings, myAPITrainings } = await validateTrainingCsv(training);

  // Having parsed all establishments, workers and training, need to cross-check all training records' establishment reference
  // (LOCALESTID) against all parsed establishments
  // Having parsed all establishments, workers and training, need to cross-check all training records' worker reference
  // (UNIQUEWORKERID) against all parsed workers
  myTrainings.forEach((thisTrainingRecord) => {
    const establishmentKey = (thisTrainingRecord.localeStId || '').replace(/\s/g, '');

    if (establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey)) {
      addNoEstablishmentError(csvTrainingSchemaErrors, thisTrainingRecord, 'Training');
      deleteTrainingRecord(myAPIWorkers, thisTrainingRecord.lineNumber);
      return;
    }

    const workerKeyNoWhitespace = (
      (thisTrainingRecord.localeStId || '') + (thisTrainingRecord.uniqueWorkerId || '')
    ).replace(/\s/g, '');

    if (!allWorkersByKey[workerKeyNoWhitespace]) {
      // not found the associated worker
      csvTrainingSchemaErrors.push(thisTrainingRecord.uncheckedWorker());

      // remove the entity
      delete myAPITrainings[thisTrainingRecord.lineNumber];
    } else {
      // gets here, all is good with the training record

      // find the associated Worker entity and forward reference this training record
      const foundWorkerByLineNumber = allWorkersByKey[workerKeyNoWhitespace];
      const knownWorker = foundWorkerByLineNumber ? myAPIWorkers[foundWorkerByLineNumber] : null;

      // training cross-validation against worker's date of birth (DOB) can only be applied, if:
      //  1. the associated Worker can be matched
      //  2. the worker has DOB defined (it's not a mandatory property)
      const trainingCompletedDate = moment.utc(thisTrainingRecord._currentLine.DATECOMPLETED, 'DD-MM-YYYY');
      const foundAssociatedWorker = workersKeyed[workerKeyNoWhitespace];
      const workerDob =
        foundAssociatedWorker && foundAssociatedWorker.DOB
          ? moment.utc(workersKeyed[workerKeyNoWhitespace].DOB, 'DD-MM-YYYY')
          : null;

      if (workerDob && workerDob.isValid() && trainingCompletedDate.diff(workerDob, 'years') < 14) {
        csvTrainingSchemaErrors.push(thisTrainingRecord.dobTrainingMismatch());
      }

      if (knownWorker) {
        knownWorker.associateTraining(myAPITrainings[thisTrainingRecord.lineNumber]);
      } else {
        // this should never happen
        console.error(
          `FATAL: failed to associate worker (line number: ${thisTrainingRecord.lineNumber}/unique id (${thisTrainingRecord.uniqueWorker})) with a known establishment.`,
        );
      }
    }
  });

  training.metadata.records = myTrainings.length;

  return { csvTrainingSchemaErrors };
};

const deleteTrainingRecord = (myAPITrainings, trainingRecord) => delete myAPITrainings[trainingRecord.lineNumber];
