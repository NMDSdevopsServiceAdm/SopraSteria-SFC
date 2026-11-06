/* jshint indent: 2 */

const { CWPRoleCategoryGroupValues } = require('../data/constants');

module.exports = function (sequelize, DataTypes) {
  const careWorkforcePathwayRoleCategory = sequelize.define(
    'careWorkforcePathwayRoleCategory',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        field: '"ID"',
      },
      seq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Seq',
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Title"',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Description"',
      },
      group: {
        type: DataTypes.ENUM,
        values: CWPRoleCategoryGroupValues,
        allowNull: false,
        field: '"Group"',
      },
      analysisFileCode: {
        type: DataTypes.INTEGER,
        field: '"AnalysisFileCode"',
      },
      bulkUploadCode: {
        type: DataTypes.TEXT,
        field: '"BulkUploadCode"',
      },
    },
    {
      tableName: 'CareWorkforcePathwayRoleCategories',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,

      defaultScope: {
        attributes: ['id', 'title', 'description', 'group'],
        order: ['seq'],
      },
      scopes: {},
    },
  );

  careWorkforcePathwayRoleCategory.addScope('bulkUpload', {
    attributes: ['id', 'bulkUploadCode'],
  });

  return careWorkforcePathwayRoleCategory;
};
