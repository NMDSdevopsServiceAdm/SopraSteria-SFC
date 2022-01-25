const moment = require('moment');

const { validateTrainingCsv } = require('./validateTrainingCsv');
const { establishmentNotFoundInFile, addNoEstablishmentError } = require('../shared/uncheckedEstablishment');
const { createWorkerKey, deleteRecord } = require('../shared/utils');
const { addNoWorkerError, workerNotFoundInFile } = require('./uncheckedWorker');

exports.validateTraining = async (training, myAPIWorkers, workersKeyed, allWorkersByKey, allEstablishmentsByKey) => {
  const { csvTrainingSchemaErrors, myTrainings, myAPITrainings } = await validateTrainingCsv(training);

  myTrainings.forEach((thisTrainingRecord) => {
    const establishmentKey = (thisTrainingRecord.localeStId || '').replace(/\s/g, '');

    if (establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey)) {
      addNoEstablishmentError(csvTrainingSchemaErrors, thisTrainingRecord, 'Training');
      deleteRecord(myAPITrainings, thisTrainingRecord.lineNumber);
      return;
    }

    const workerKey = createWorkerKey(thisTrainingRecord.localeStId, thisTrainingRecord.uniqueWorkerId);

    if (workerNotFoundInFile(allWorkersByKey, workerKey)) {
      addNoWorkerError(csvTrainingSchemaErrors, thisTrainingRecord);
      deleteRecord(myAPITrainings, thisTrainingRecord.lineNumber);
      return;
    }

    // find the associated Worker entity and forward reference this training record
    const foundWorkerByLineNumber = allWorkersByKey[workerKey];
    const knownWorker = foundWorkerByLineNumber ? myAPIWorkers[foundWorkerByLineNumber] : null;

    // training cross-validation against worker's date of birth (DOB) can only be applied, if:
    //  1. the associated Worker can be matched
    //  2. the worker has DOB defined (it's not a mandatory property)
    const trainingCompletedDate = moment.utc(thisTrainingRecord._currentLine.DATECOMPLETED, 'DD-MM-YYYY');
    const foundAssociatedWorker = workersKeyed[workerKey];
    const workerDob =
      foundAssociatedWorker && foundAssociatedWorker.DOB ? moment.utc(workersKeyed[workerKey].DOB, 'DD-MM-YYYY') : null;

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
  });

  training.metadata.records = myTrainings.length;

  return { csvTrainingSchemaErrors };
};
