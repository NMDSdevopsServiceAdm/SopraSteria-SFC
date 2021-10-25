const Training = require('../../../models/classes/training').Training;
const MandatoryTraining = require('../../../models/classes/mandatoryTraining').MandatoryTraining;
const { formatTrainingRecords } = require('../../../utils/trainingRecordsUtils');


const getAllTraining = async (establishmentId,workerUid) => {
  const allTrainingRecords = await Training.fetch(establishmentId, workerUid);
  const mandatoryTrainingForWorker = await MandatoryTraining.fetchMandatoryTrainingForWorker(workerUid);

  return formatTrainingRecords(allTrainingRecords, mandatoryTrainingForWorker);
}

module.exports.getAllTraining = getAllTraining;
