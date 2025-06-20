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
      text: {
        type: DataTypes.TEXT,
        field: 'Text',
      },
      isOther: {
        type: DataTypes.BOOLEAN,
        field: 'IsOther',
        defaultValue: false,
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
      through: 'EstablishmentCWPReasons',
      foreignKey: 'careWorkforcePathwayReasonID',
      sourceKey: 'id',
    });
  };

  return CareWorkforcePathwayReasons;
};
