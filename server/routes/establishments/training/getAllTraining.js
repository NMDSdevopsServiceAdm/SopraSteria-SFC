const Training = require('../../../models/classes/training').Training;
const MandatoryTraining = require('../../../models/classes/mandatoryTraining').MandatoryTraining;
const { formatTrainingRecords } = require('../../../utils/trainingRecordsUtils');

const getAllTraining = async (establishmentId,workerUid) => {
  const allTrainingRecords = await Training.fetch(establishmentId, workerUid);
  const mandatoryTrainingForWorker = await MandatoryTraining.fetchMandatoryTrainingForWorker(workerUid);

  const formattedTraining = formatTrainingRecords(allTrainingRecords, mandatoryTrainingForWorker);

  return {
    ...formattedTraining,
    lastUpdated: allTrainingRecords.lastUpdated,
    jobRoleMandatoryTrainingCount: mandatoryTrainingForWorker.length,
  }
}

module.exports.getAllTraining = getAllTraining;
