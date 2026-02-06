module.exports = function (sequelize, DataTypes) {
  const TravelTimePayOption = sequelize.define(
    'travelTimePayOption',
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
      label: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Label',
      },
      includeRate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'IncludeRate',
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
      tableName: 'TravelTimePayOption',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,

      defaultScope: {
        attributes: ['id', 'label', 'includeRate'],
        order: [['seq', 'ASC']],
      },
    },
  );

  TravelTimePayOption.associate = (models) => {
    TravelTimePayOption.hasMany(models.establishment, {
      foreignKey: 'TravelTimePayOptionFK',
      targetKey: 'id',
      as: 'establishment',
    });
  };

  TravelTimePayOption.addScope('bulkUpload', {
    attributes: ['id', 'bulkUploadCode', 'includeRate'],
  });

  return TravelTimePayOption;
};
