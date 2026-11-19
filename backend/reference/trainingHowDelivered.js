const models = require('../server/models/index');

const build_training_how_delivered_mappings = () => {
  const enumChoices = models.workerTraining.getAttributes().howWasItDelivered.values;
  const mappings = enumChoices.map((howWasItDelivered, index) => {
    return { ASC: howWasItDelivered, BUDI: index + 1 };
  });

  return mappings;
};

module.exports = { build_training_how_delivered_mappings };
