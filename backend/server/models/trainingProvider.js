module.exports = function (sequelize, DataTypes) {
  const TrainingProvider = sequelize.define(
    'trainingProvider',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Name',
      },
      bulkUploadCode: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        field: 'BulkUploadCode',
      },
      isOther: {
        type: DataTypes.BOOLEAN,
        field: 'IsOther',
        defaultValue: false,
      },
    },
    {
      tableName: 'TrainingProvider',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,

      defaultScope: {
        attributes: ['id', 'name', 'isOther'],
      },
    },
  );

  TrainingProvider.associate = (models) => {
    TrainingProvider.hasMany(models.trainingCourse, {
      foreignKey: 'trainingProviderFk',
      targetKey: 'id',
      as: 'trainingCourse',
    });

    TrainingProvider.hasMany(models.workerTraining, {
      foreignKey: 'trainingProviderFk',
      targetKey: 'id',
      as: 'workerTraining',
    });
  };

  TrainingProvider.addScope('bulkUpload', {
    attributes: ['id', 'bulkUploadCode', 'isOther'],
  });

  return TrainingProvider;
};
