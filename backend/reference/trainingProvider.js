const models = require('../server/models/index');

const build_training_provider_mappings = async () => {
  const rawData = await models.trainingProvider.findAll({ attributes: ['id', 'bulkUploadCode'], raw: true });
  const mappings = rawData.map((trainingProvider) => {
    return { ASC: trainingProvider.id, BUDI: trainingProvider.bulkUploadCode };
  });

  return mappings;
};

module.exports = { build_training_provider_mappings };
