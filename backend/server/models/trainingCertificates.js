/* jshint indent: 2 */
const dayjs = require('dayjs');

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
      key: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Key"',
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

  TrainingCertificates.addCertificate = function ({ trainingRecordId, workerFk, filename, fileId, key }) {
    const timeNow = dayjs().format();

    return this.create({
      uid: fileId,
      workerFk: workerFk,
      workerTrainingFk: trainingRecordId,
      filename: filename,
      uploadDate: timeNow,
      key,
    });
  };

  TrainingCertificates.deleteCertificate = async function (key) {
    return await this.destroy({
      where: {
        key: key,
      },
    });
  };

  return TrainingCertificates;
};
