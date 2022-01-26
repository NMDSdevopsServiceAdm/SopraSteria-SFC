const dobTrainingMismatch = (record) => {
  return {
    origin: 'Training',
    lineNumber: record.lineNumber,
    errCode: WORKER_DOB_TRAINING_WARNING(),
    errType: 'WORKER_DOB_TRAINING_WARNING',
    error: "DATECOMPLETED is before staff record's date of birth",
    source: record.localId,
    column: 'DATECOMPLETED',
    worker: record.uniqueWorkerId,
    name: record.localId,
  };
};

const WORKER_DOB_TRAINING_WARNING = () => 1080;

exports.addDobTrainingMismatchError = (csvTrainingSchemaErrors, trainingRecord) =>
  csvTrainingSchemaErrors.push(dobTrainingMismatch(trainingRecord));
