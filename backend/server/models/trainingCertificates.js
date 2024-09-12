/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const TrainingCertificates = sequelize.define(
    'trainingCertificates',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"ID"',
      },
      uid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: '"UID"',
      },
      workerFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"WorkerFK"',
      },
      workerTrainingFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"WorkerTrainingFK"',
      },
      filename: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"FileName"',
      },
      uploadDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: '"UploadDate"',
      },
    },
    {
      tableName: 'TrainingCertificates',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  TrainingCertificates.associate = (models) => {
    TrainingCertificates.belongsTo(models.worker, {
      foreignKey: 'workerFk',
      targetKey: 'id',
      as: 'worker',
    });

    TrainingCertificates.belongsTo(models.workerTraining, {
      foreignKey: 'workerTrainingFk',
      targetKey: 'id',
      as: 'workerTraining',
    });
  };

  return TrainingCertificates;
};
