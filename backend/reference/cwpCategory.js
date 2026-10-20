const models = require('../server/models/index');

const build_cwp_category_mappings = async () => {
  const rawData = await models.careWorkforcePathwayRoleCategory.findAll({
    attributes: ['id', 'bulkUploadCode', 'group'],
    raw: true,
  });

  return rawData.map((category) => ({
    ASC: category.id,
    BUDI: category.bulkUploadCode,
    group: category.group,
  }));
};

module.exports = { build_cwp_category_mappings };
