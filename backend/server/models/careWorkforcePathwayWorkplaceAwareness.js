/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const careWorkforcePathwayWorkplaceAwareness = sequelize.define(
    'careWorkforcePathwayWorkplaceAwareness',
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
      analysisFileCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'AnalysisFileCode',
      },
      bulkUploadCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'BulkUploadCode',
      },
    },
    {
      tableName: 'CareWorkforcePathwayWorkplaceAwareness',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );
  return careWorkforcePathwayWorkplaceAwareness;
};
