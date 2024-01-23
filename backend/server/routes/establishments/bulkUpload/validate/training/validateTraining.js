const { addDobTrainingMismatchError, trainingCompletedBeforeAgeFourteen } = require('./dobTrainingMismatch');

const { validateTrainingCsv } = require('./validateTrainingCsv');
const {
  establishmentNotFoundInFile,
  addNoAssociatedEstablishmentError,
} = require('../shared/noAssociatedEstablishment');
const { createWorkerKey, createEstablishmentKey, deleteRecord } = require('../../../../../utils/bulkUploadUtils.js');
const { addNoAssociatedWorkerError, workerNotFoundInFile } = require('./noAssociatedWorker');

const validateTraining = async (training, myAPIWorkers, workersKeyed, allWorkersByKey, allEstablishmentsByKey) => {
  const { csvTrainingSchemaErrors, JSONTraining, APITrainingRecords } = await validateTrainingCsv(training);

  JSONTraining.forEach((trainingRecord) => {
    const establishmentKey = createEstablishmentKey(trainingRecord.localId);

    if (establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey)) {
      addNoAssociatedEstablishmentError(csvTrainingSchemaErrors, trainingRecord, 'Training');
      deleteRecord(APITrainingRecords, trainingRecord.lineNumber);
      return;
    }

    const workerKey = createWorkerKey(trainingRecord.localId, trainingRecord.uniqueWorkerId);

    if (workerNotFoundInFile(allWorkersByKey, workerKey)) {
      addNoAssociatedWorkerError(csvTrainingSchemaErrors, trainingRecord);
      deleteRecord(APITrainingRecords, trainingRecord.lineNumber);
      return;
    }

    if (trainingCompletedBeforeAgeFourteen(trainingRecord, workersKeyed, workerKey)) {
      addDobTrainingMismatchError(csvTrainingSchemaErrors, trainingRecord);
    }

    associateTrainingWithWorker(allWorkersByKey, workerKey, myAPIWorkers, APITrainingRecords, trainingRecord);
  });

  training.metadata.records = JSONTraining.length;

  return { csvTrainingSchemaErrors };
};

const associateTrainingWithWorker = (allWorkersByKey, workerKey, myAPIWorkers, APITrainingRecords, trainingRecord) => {
  const foundWorkerByLineNumber = allWorkersByKey[workerKey];
  const knownWorker = foundWorkerByLineNumber ? myAPIWorkers[foundWorkerByLineNumber] : null;

  if (knownWorker) {
    knownWorker.associateTraining(APITrainingRecords[trainingRecord.lineNumber]);
  } else {
    console.error(
      `FATAL: failed to associate training record (line number: ${trainingRecord.lineNumber}/unique id (${trainingRecord.uniqueWorkerId})) with a known worker.`,
    );
  }
};

module.exports = {
  validateTraining,
  associateTrainingWithWorker,
};
