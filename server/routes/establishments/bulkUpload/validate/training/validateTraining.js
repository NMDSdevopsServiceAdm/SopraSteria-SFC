const { addDobTrainingMismatchError, trainingCompletedBeforeAgeFourteen } = require('./dobTrainingMismatch');

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

    if (trainingCompletedBeforeAgeFourteen(trainingRecord, workersKeyed, workerKey)) {
      addDobTrainingMismatchError(csvTrainingSchemaErrors, trainingRecord);
    }

    associateTrainingWithWorker(allWorkersByKey, workerKey, myAPIWorkers, myAPITrainings, trainingRecord);
  });

  training.metadata.records = myJSONTrainings.length;

  return { csvTrainingSchemaErrors };
};

const associateTrainingWithWorker = (allWorkersByKey, workerKey, myAPIWorkers, myAPITrainings, trainingRecord) => {
  const foundWorkerByLineNumber = allWorkersByKey[workerKey];
  const knownWorker = foundWorkerByLineNumber ? myAPIWorkers[foundWorkerByLineNumber] : null;

  if (knownWorker) {
    knownWorker.associateTraining(myAPITrainings[trainingRecord.lineNumber]);
  } else {
    console.error(
      `FATAL: failed to associate training record (line number: ${trainingRecord.lineNumber}/unique id (${trainingRecord.uniqueWorkerId})) with a known worker.`,
    );
  }
};
