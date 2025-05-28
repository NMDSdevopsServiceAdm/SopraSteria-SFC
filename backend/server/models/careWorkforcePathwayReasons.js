/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const CareWorkforcePathwayReasons = sequelize.define(
    'CareWorkforcePathwayReasons',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      seq: {
        type: DataTypes.INTEGER,
        unique: true,
        field: 'Seq',
      },
      reason: {
        type: DataTypes.TEXT,
        field: 'Reason',
      },
      analysisFileCode: {
        type: DataTypes.INTEGER,
        unique: true,
        field: 'AnalysisFileCode',
      },
      bulkUploadCode: {
        type: DataTypes.INTEGER,
        unique: true,
        field: 'BulkUploadCode',
      },
    },

    {
      tableName: 'CareWorkforcePathwayReasons',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  CareWorkforcePathwayReasons.associate = (models) => {
    CareWorkforcePathwayReasons.belongsToMany(models.establishment, {
      through: 'EstablishmentCWPReason',
      foreignKey: 'careWorkforcePathwayReasonID',
      sourceKey: 'id',
    });
  };

  return CareWorkforcePathwayReasons;
};
