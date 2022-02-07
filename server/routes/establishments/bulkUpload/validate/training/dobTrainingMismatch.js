const moment = require('moment');

const dobTrainingMismatch = (record) => {
  return {
    origin: 'Training',
    lineNumber: record.lineNumber,
    errCode: WORKER_DOB_TRAINING_WARNING(),
    errType: 'WORKER_DOB_TRAINING_WARNING',
    error: "DATECOMPLETED is within 14 years of staff record's date of birth",
    source: record.localId,
    column: 'DATECOMPLETED',
    worker: record.uniqueWorkerId,
    name: record.localId,
  };
};

const WORKER_DOB_TRAINING_WARNING = () => 1080;

const trainingCompletedBeforeAgeFourteen = (trainingRecord, workersKeyed, workerKey) => {
  const trainingCompletedDate = moment.utc(trainingRecord.completed, 'DD-MM-YYYY');
  const associatedWorker = workersKeyed[workerKey];
  const workerDob = associatedWorker && associatedWorker.DOB ? moment.utc(associatedWorker.DOB, 'DD-MM-YYYY') : null;

  return !!(workerDob && workerDob.isValid() && trainingCompletedDate.diff(workerDob, 'years') < 14);
};

const addDobTrainingMismatchError = (csvTrainingSchemaErrors, trainingRecord) =>
  csvTrainingSchemaErrors.push(dobTrainingMismatch(trainingRecord));

module.exports = {
  trainingCompletedBeforeAgeFourteen,
  addDobTrainingMismatchError,
};
