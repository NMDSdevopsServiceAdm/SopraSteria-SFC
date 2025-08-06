/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const delegatedHealthcareActivities = sequelize.define(
    'delegatedHealthcareActivities',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        field: 'ID',
      },
      seq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Seq',
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Title',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Description',
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
      tableName: 'DelegatedHealthcareActivities',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );
  return delegatedHealthcareActivities;
};
