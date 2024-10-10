/* jshint indent: 2 */
const dayjs = require('dayjs');

module.exports = function (sequelize, DataTypes) {
  const QualificationCertificates = sequelize.define(
    'qualificationCertificates',
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
      workerQualificationsFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"WorkerQualificationsFK"',
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
      tableName: 'QualificationCertificates',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  QualificationCertificates.associate = (models) => {
    QualificationCertificates.belongsTo(models.worker, {
      foreignKey: 'workerFk',
      targetKey: 'id',
      as: 'worker',
    });

    QualificationCertificates.belongsTo(models.workerQualifications, {
      foreignKey: 'workerQualificationsFk',
      targetKey: 'id',
      as: 'workerQualifications',
    });
  };

  QualificationCertificates.addCertificate = function ({ qualificationRecordId, workerFk, filename, fileId, key }) {
    const timeNow = dayjs().format();

    return this.create({
      uid: fileId,
      workerFk: workerFk,
      workerQualificationsFk: qualificationRecordId,
      filename: filename,
      uploadDate: timeNow,
      key,
    });
  };

  QualificationCertificates.deleteCertificate = async function (uids) {
    return await this.destroy({
      where: {
        uid: uids,
      },
    });
  };

  QualificationCertificates.countCertificatesToBeDeleted = async function (uids) {
    return await this.count({
      where: {
        uid: uids,
      },
    });
  };

  return QualificationsCertificates;
};
