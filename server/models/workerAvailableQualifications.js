/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const WorkerQualifications = sequelize.define(
    'workerAvailableQualifications',
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
      group: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Group"',
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Title"',
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"Level"',
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"Code"',
      },
      from: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"From"',
      },
      until: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Until"',
      },
      multipleLevels: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"MultipleLevel"',
      },
      socialCareRelevant: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"RelevantToSocialCare"',
      },
      analysisFileCode: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"AnalysisFileCode"',
      },
    },
    {
      tableName: 'Qualifications',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return WorkerQualifications;
};
