const moment = require('moment');
const { addDobTrainingMismatchError } = require('./dobTrainingMismatch');

const { validateTrainingCsv } = require('./validateTrainingCsv');
const { establishmentNotFoundInFile, addNoEstablishmentError } = require('../shared/uncheckedEstablishment');
const { createWorkerKey, deleteRecord } = require('../shared/utils');
const { addNoWorkerError, workerNotFoundInFile } = require('./uncheckedWorker');

exports.validateTraining = async (training, myAPIWorkers, workersKeyed, allWorkersByKey, allEstablishmentsByKey) => {
  const { csvTrainingSchemaErrors, myJSONTrainings, myAPITrainings } = await validateTrainingCsv(training);

  myJSONTrainings.forEach((trainingRecord) => {
    const establishmentKey = (trainingRecord.localId || '').replace(/\s/g, '');

    if (establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey)) {
      addNoEstablishmentError(csvTrainingSchemaErrors, trainingRecord, 'Training');
      deleteRecord(myAPITrainings, trainingRecord.lineNumber);
      return;
    }

    const workerKey = createWorkerKey(trainingRecord.localId, trainingRecord.uniqueWorkerId);

    if (workerNotFoundInFile(allWorkersByKey, workerKey)) {
      addNoWorkerError(csvTrainingSchemaErrors, trainingRecord);
      deleteRecord(myAPITrainings, trainingRecord.lineNumber);
      return;
    }

    // training cross-validation against worker's date of birth (DOB) can only be applied, if:
    //  1. the associated Worker can be matched
    //  2. the worker has DOB defined (it's not a mandatory property)
    const foundWorkerByLineNumber = allWorkersByKey[workerKey];
    const knownWorker = foundWorkerByLineNumber ? myAPIWorkers[foundWorkerByLineNumber] : null;

    const trainingCompletedDate = moment.utc(trainingRecord.completed, 'DD-MM-YYYY');
    const foundAssociatedWorker = workersKeyed[workerKey];
    const workerDob =
      foundAssociatedWorker && foundAssociatedWorker.DOB ? moment.utc(workersKeyed[workerKey].DOB, 'DD-MM-YYYY') : null;

    if (workerDob && workerDob.isValid() && trainingCompletedDate.diff(workerDob, 'years') < 14) {
      addDobTrainingMismatchError(csvTrainingSchemaErrors, trainingRecord);
    }

    if (knownWorker) {
      knownWorker.associateTraining(myAPITrainings[trainingRecord.lineNumber]);
    } else {
      // this should never happen
      console.error(
        `FATAL: failed to associate worker (line number: ${trainingRecord.lineNumber}/unique id (${trainingRecord.uniqueWorkerId})) with a known establishment.`,
      );
    }
  });

  training.metadata.records = myJSONTrainings.length;

  return { csvTrainingSchemaErrors };
};
