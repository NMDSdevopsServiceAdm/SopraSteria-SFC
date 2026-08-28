const models = require('../server/models/index');

const build_nurse_field_of_practice_mappings = async () => {
  const rawData = await models.nurseFieldOfPractice.scope('bulkUpload').findAll({ raw: true });
  const mappings = rawData.map((field) => {
    return { ASC: field.id, BUDI: field.bulkUploadCode };
  });

  return mappings;
};

module.exports = { build_nurse_field_of_practice_mappings };
