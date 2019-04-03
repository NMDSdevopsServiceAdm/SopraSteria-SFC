/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const WorkerQualifications =  sequelize.define('workerQualifications', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"ID"'
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: '"UID"'
    },
    workerFk : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"WorkerFK"'
    },
    qualificationFk : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"QualificationsFK"'
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['NVQ', 'Any other qualification', 'Certificate', 'Degree', 'Assessor and mentoring', 'Award',  'Diploma', 'Apprenticeship'],
      field: '"Type"'
    },
    year : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"Year"'
    },
    other : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Other"'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Notes"'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created'
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated'
    },
    updatedBy: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'updatedby'
    },
  }, {
    tableName: 'WorkerQualifications',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  WorkerQualifications.associate = (models) => {
    WorkerQualifications.belongsTo(models.worker, {
      foreignKey: 'workerFk',
      targetKey: 'id',
      as: 'worker'
    });
    WorkerQualifications.belongsTo(models.workerAvailableQualifications, {
      foreignKey: 'qualificationFk',
      targetKey: 'id',
      as: 'qualification'
    });
  };

  return WorkerQualifications;
};
